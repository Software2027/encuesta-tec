import random
from django.core.management.base import BaseCommand
from encuestas.models import Pregunta, Opcion, RespuestaEncuesta, DetalleRespuesta

class Command(BaseCommand):
    help = 'Genera encuestas completadas de prueba para verificar las estadísticas del Dashboard'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Generando 15 encuestas de prueba...'))

        nombres_ejemplo = [
            'Carolina Gómez', 'Lucas Fernández', 'María José Rossi', 'Esteban Peralta',
            'Florencia Diaz', 'Gonzalo Morales', 'Valentina Ruiz', 'Martín Silva',
            'Agustina Albarracín', 'Diego Mansilla', 'Sofia Cabrera', 'Joaquín Vega',
            'Mariana López', 'Sebastián Romero', 'Lucía Bustos'
        ]

        comentarios_ejemplo = [
            '¡Excelente evento! Gran nivel técnico en los paneles de Inteligencia Artificial.',
            'Muy buena organización y conectividad WiFi en el predio. Felicitaciones al equipo de Malagueño.',
            'Me gustaría que en la próxima edición incluyan más talleres prácticos de ciberseguridad.',
            'Muy buenas disertaciones, sigan impulsando la tecnología e innovación en el municipio.',
            'Todo impecable, la acreditación fue super ágil y las carpas estaban muy bien climatizadas.'
        ]

        preguntas = Pregunta.objects.filter(activa=True).prefetch_related('opciones')

        for i in range(15):
            nombre = nombres_ejemplo[i % len(nombres_ejemplo)]
            email = f"{nombre.lower().replace(' ', '.')}@ejemplo.com"
            ip = f"192.168.1.{10 + i}"

            encuesta = RespuestaEncuesta.objects.create(
                nombre_participante=nombre,
                email_participante=email,
                ip_origen=ip,
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0'
            )

            for preg in preguntas:
                if preg.tipo in [Pregunta.TIPO_CARITAS, Pregunta.TIPO_ESTRELLAS]:
                    # Tendencia a calificaciones altas (4 o 5)
                    val = random.choices([1, 2, 3, 4, 5], weights=[1, 2, 4, 10, 15])[0]
                    DetalleRespuesta.objects.create(
                        encuesta=encuesta,
                        pregunta=preg,
                        valor_numerico=val
                    )
                elif preg.tipo == Pregunta.TIPO_OPCION_UNICA:
                    opciones = list(preg.opciones.all())
                    if opciones:
                        op_elegida = random.choice(opciones)
                        det = DetalleRespuesta.objects.create(
                            encuesta=encuesta,
                            pregunta=preg
                        )
                        det.opciones_seleccionadas.add(op_elegida)
                elif preg.tipo == Pregunta.TIPO_OPCION_MULTIPLE:
                    opciones = list(preg.opciones.all())
                    if opciones:
                        op_elegidas = random.sample(opciones, k=random.randint(1, min(3, len(opciones))))
                        det = DetalleRespuesta.objects.create(
                            encuesta=encuesta,
                            pregunta=preg
                        )
                        det.opciones_seleccionadas.set(op_elegidas)
                elif preg.tipo == Pregunta.TIPO_TEXTO:
                    if random.random() > 0.4:
                        com = random.choice(comentarios_ejemplo)
                        DetalleRespuesta.objects.create(
                            encuesta=encuesta,
                            pregunta=preg,
                            valor_texto=com
                        )

        self.stdout.write(self.style.SUCCESS('¡15 encuestas de prueba generadas exitosamente!'))
