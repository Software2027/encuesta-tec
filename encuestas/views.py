import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Avg, Count
from .models import Pregunta, Opcion, RespuestaEncuesta, DetalleRespuesta

def get_client_ip(request):
    """Obtiene la dirección IP real del cliente."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def encuesta_publica(request):
    """Vista principal para Tótem Táctil (3 Caritas + Pop-up)."""
    pregunta = Pregunta.objects.filter(activa=True).prefetch_related('opciones').first()
    opciones = pregunta.opciones.all() if pregunta else []
    return render(request, 'encuestas/encuesta.html', {
        'pregunta_principal': pregunta,
        'opciones': opciones
    })

def gracias_view(request):
    """Vista de agradecimiento."""
    return render(request, 'encuestas/gracias.html')

def resultados_view(request):
    """Vista analítica de resultados separada por estado y ranking de opciones."""
    # Obtener la pregunta activa del tótem
    pregunta_totem = Pregunta.objects.filter(activa=True).first()
    if not pregunta_totem:
        pregunta_totem = Pregunta.objects.filter(tipo=Pregunta.TIPO_CARITAS_TOTEM).first()

    total_votos = RespuestaEncuesta.objects.count()

    muy_satisfecho_cnt = DetalleRespuesta.objects.filter(valor_numerico=3).count()
    satisfecho_cnt = DetalleRespuesta.objects.filter(valor_numerico=2).count()
    poco_satisfecho_cnt = DetalleRespuesta.objects.filter(valor_numerico=1).count()

    # Opciones asociadas exclusivamente al formulario pop-up del tótem
    opciones_base = Opcion.objects.filter(pregunta=pregunta_totem) if pregunta_totem else Opcion.objects.none()

    # Ranking global de opciones del pop-up ordenadas por votos
    opciones_ranking = opciones_base.annotate(
        total_menciones=Count('detallerespuesta')
    ).order_by('-total_menciones')

    # Opciones seleccionadas según cada carita (filtradas a las del tótem)
    opciones_muy_satisfecho = opciones_base.filter(
        detallerespuesta__valor_numerico=3
    ).annotate(menciones=Count('detallerespuesta')).order_by('-menciones')

    opciones_satisfecho = opciones_base.filter(
        detallerespuesta__valor_numerico=2
    ).annotate(menciones=Count('detallerespuesta')).order_by('-menciones')

    opciones_poco_satisfecho = opciones_base.filter(
        detallerespuesta__valor_numerico=1
    ).annotate(menciones=Count('detallerespuesta')).order_by('-menciones')

    return render(request, 'encuestas/resultados.html', {
        'total_votos': total_votos,
        'muy_satisfecho_cnt': muy_satisfecho_cnt,
        'satisfecho_cnt': satisfecho_cnt,
        'poco_satisfecho_cnt': poco_satisfecho_cnt,
        'opciones_ranking': opciones_ranking,
        'opciones_muy_satisfecho': opciones_muy_satisfecho,
        'opciones_satisfecho': opciones_satisfecho,
        'opciones_poco_satisfecho': opciones_poco_satisfecho,
    })

@require_POST
def guardar_respuesta_api(request):
    """Endpoint AJAX POST para guardar la encuesta desde el Tótem Táctil."""
    try:
        data = json.loads(request.body.decode('utf-8'))
        
        pregunta_id = data.get('pregunta_id')
        valor_numerico = data.get('valor_numerico') # 1: Poco Satisfecho, 2: Satisfecho, 3: Muy Satisfecho
        opciones_ids = data.get('opciones', [])

        # Crear registro de encuesta recibida en el Tótem
        encuesta = RespuestaEncuesta.objects.create(
            nombre_participante='Tótem Táctil',
            email_participante=None,
            ip_origen=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')[:255]
        )

        try:
            pregunta = Pregunta.objects.get(id=pregunta_id)
        except Pregunta.DoesNotExist:
            pregunta = Pregunta.objects.filter(activa=True).first()

        if pregunta:
            detalle = DetalleRespuesta.objects.create(
                encuesta=encuesta,
                pregunta=pregunta,
                valor_numerico=valor_numerico
            )

            if opciones_ids:
                opciones_objs = Opcion.objects.filter(id__in=opciones_ids)
                detalle.opciones_seleccionadas.set(opciones_objs)

        return JsonResponse({'success': True, 'message': 'Encuesta en tótem guardada correctamente.'})

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@staff_member_required
def dashboard_view(request):
    """Vista del dashboard de estadísticas."""
    comentarios = DetalleRespuesta.objects.filter(
        valor_texto__isnull=False
    ).exclude(
        valor_texto__exact=''
    ).select_related('encuesta', 'pregunta').order_by('-encuesta__fecha_envio')[:20]

    return render(request, 'encuestas/dashboard.html', {
        'comentarios': comentarios
    })

@staff_member_required
def estadisticas_api(request):
    """Endpoint JSON que provee las métricas para Chart.js."""
    total_encuestas = RespuestaEncuesta.objects.count()

    promedio_general = DetalleRespuesta.objects.filter(
        valor_numerico__isnull=False
    ).aggregate(promedio=Avg('valor_numerico'))['promedio'] or 0.0

    distribucion_qs = DetalleRespuesta.objects.filter(
        valor_numerico__isnull=False
    ).values('valor_numerico').annotate(total=Count('id'))

    distribucion_dict = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for item in distribucion_qs:
        val = item['valor_numerico']
        if val in distribucion_dict:
            distribucion_dict[val] = item['total']

    return JsonResponse({
        'success': True,
        'total_respuestas': total_encuestas,
        'promedio_general': round(promedio_general, 2),
        'satisfaccion_distribucion': distribucion_dict,
        'total_comentarios': 0
    })
