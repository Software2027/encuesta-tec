from django.db import models

class Seccion(models.Model):
    nombre = models.CharField(max_length=150, verbose_name="Nombre de la Sección")
    descripcion = models.TextField(blank=True, null=True, verbose_name="Descripción")
    orden = models.PositiveIntegerField(default=0, verbose_name="Orden de visualización")
    activa = models.BooleanField(default=True, verbose_name="¿Sección activa?")

    class Meta:
        verbose_name = "Sección"
        verbose_name_plural = "Secciones"
        ordering = ['orden', 'id']

    def __str__(self):
        return self.nombre


class Pregunta(models.Model):
    TIPO_CARITAS_TOTEM = 'CARITAS_TOTEM'
    TIPO_CARITAS = 'CARITAS'
    TIPO_ESTRELLAS = 'ESTRELLAS'
    TIPO_OPCION_UNICA = 'OPCION_UNICA'
    TIPO_OPCION_MULTIPLE = 'OPCION_MULTIPLE'
    TIPO_TEXTO = 'TEXTO'

    TIPO_CHOICES = [
        (TIPO_CARITAS_TOTEM, 'Tótem Táctil (3 Caritas + Pop-up)'),
        (TIPO_CARITAS, 'Escala de Caritas (1 a 5)'),
        (TIPO_ESTRELLAS, 'Calificación en Estrellas (1 a 5)'),
        (TIPO_OPCION_UNICA, 'Opción Única (Radio)'),
        (TIPO_OPCION_MULTIPLE, 'Opción Múltiple (Checkboxes)'),
        (TIPO_TEXTO, 'Texto Libre / Sugerencias'),
    ]

    seccion = models.ForeignKey(
        Seccion, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='preguntas',
        verbose_name="Sección"
    )
    enunciado = models.CharField(max_length=255, verbose_name="Enunciado de la pregunta")
    tipo = models.CharField(max_length=25, choices=TIPO_CHOICES, default=TIPO_CARITAS_TOTEM, verbose_name="Tipo de pregunta")
    orden = models.PositiveIntegerField(default=0, verbose_name="Orden de presentación")
    requerida = models.BooleanField(default=True, verbose_name="¿Es obligatoria?")
    activa = models.BooleanField(default=True, verbose_name="¿Está activa?")
    creada_en = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")

    class Meta:
        verbose_name = "Pregunta"
        verbose_name_plural = "Preguntas"
        ordering = ['orden', 'id']

    def __str__(self):
        return f"{self.orden}. {self.enunciado} ({self.get_tipo_display()})"


class Opcion(models.Model):
    pregunta = models.ForeignKey(Pregunta, on_delete=models.CASCADE, related_name='opciones', verbose_name="Pregunta")
    texto = models.CharField(max_length=200, verbose_name="Texto de la opción")
    orden = models.PositiveIntegerField(default=0, verbose_name="Orden")

    class Meta:
        verbose_name = "Opción de Respuesta"
        verbose_name_plural = "Opciones de Respuesta"
        ordering = ['orden', 'id']

    def __str__(self):
        return self.texto


class RespuestaEncuesta(models.Model):
    fecha_envio = models.DateTimeField(auto_now_add=True, verbose_name="Fecha y hora de envío")
    ip_origen = models.GenericIPAddressField(null=True, blank=True, verbose_name="Dirección IP")
    user_agent = models.CharField(max_length=255, null=True, blank=True, verbose_name="Dispositivo / Navegador")
    nombre_participante = models.CharField(max_length=100, blank=True, default="Tótem Táctil", verbose_name="Nombre del participante")
    email_participante = models.EmailField(blank=True, null=True, verbose_name="Correo electrónico")

    class Meta:
        verbose_name = "Encuesta Completada"
        verbose_name_plural = "Encuestas Completadas"
        ordering = ['-fecha_envio']

    def __str__(self):
        return f"Encuesta #{self.id} - {self.fecha_envio.strftime('%d/%m/%Y %H:%M')}"


class DetalleRespuesta(models.Model):
    encuesta = models.ForeignKey(RespuestaEncuesta, on_delete=models.CASCADE, related_name='detalles', verbose_name="Encuesta")
    pregunta = models.ForeignKey(Pregunta, on_delete=models.CASCADE, verbose_name="Pregunta")
    valor_numerico = models.IntegerField(null=True, blank=True, verbose_name="Valor numérico (1-3 o 1-5)")
    valor_texto = models.TextField(null=True, blank=True, verbose_name="Respuesta de texto")
    opciones_seleccionadas = models.ManyToManyField(Opcion, blank=True, verbose_name="Opciones seleccionadas")

    class Meta:
        verbose_name = "Detalle de Respuesta"
        verbose_name_plural = "Detalles de Respuestas"

    def __str__(self):
        return f"Respuesta a: {self.pregunta.enunciado}"
