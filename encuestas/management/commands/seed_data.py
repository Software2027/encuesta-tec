from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from encuestas.models import Seccion, Pregunta, Opcion

class Command(BaseCommand):
    help = 'Poblar la base de datos con la encuesta para Tótem Táctil (3 Caritas + Pop-up)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Cargando encuesta para Tótem Táctil...'))

        # 1. Superusuario
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@malagueno.gob.ar', 'admin123')
            self.stdout.write(self.style.SUCCESS('Superusuario listo: admin / admin123'))

        # 2. Desactivar preguntas anteriores para evitar mezclas
        Pregunta.objects.all().update(activa=False)

        # 3. Sección Única de Tótem
        sec_totem, _ = Seccion.objects.get_or_create(
            nombre='Evaluación General Tótem',
            defaults={'descripcion': 'Experiencia directa en Tótem Táctil', 'orden': 1, 'activa': True}
        )

        # 4. Crear Pregunta Tótem Principal (3 Caritas)
        preg_totem, created = Pregunta.objects.get_or_create(
            enunciado='¿Cómo calificas tu experiencia en la Edición IV TEG?',
            defaults={
                'seccion': sec_totem,
                'tipo': Pregunta.TIPO_CARITAS_TOTEM,
                'orden': 1,
                'requerida': True,
                'activa': True
            }
        )
        # Asegurar que esté activa y con tipo tótem
        preg_totem.activa = True
        preg_totem.tipo = Pregunta.TIPO_CARITAS_TOTEM
        preg_totem.save()

        # Opciones táctiles para el Pop-up
        opciones_totem = [
            'Organización y Atención',
            'Calidad de Charlas y Talleres',
            'Instalaciones y Climatización',
            'Stands Tecnológicos e Innovación',
            'Acreditación Ágil',
            'Conectividad / WiFi'
        ]

        preg_totem.opciones.all().delete()
        for idx, op_texto in enumerate(opciones_totem, 1):
            Opcion.objects.create(pregunta=preg_totem, texto=op_texto, orden=idx)

        self.stdout.write(self.style.SUCCESS('¡Encuesta Tótem Táctil cargada con éxito (3 Caritas + Pop-up)!'))
