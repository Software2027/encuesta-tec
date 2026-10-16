from django.conf import settings

def branding(request):
    """
    Context processor para exponer el branding institucional a todas las plantillas.
    """
    return {
        'EVENTO_NOMBRE': getattr(settings, 'EVENTO_NOMBRE', 'Edición IV TEG Tecnología e Innovación Malagueño'),
        'EVENTO_AREA': getattr(settings, 'EVENTO_AREA', 'Dirección de Modernización, Innovación y TICs'),
        'EVENTO_LEMA': getattr(settings, 'EVENTO_LEMA', 'Mejor Malagueño'),
    }
