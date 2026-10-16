from django.contrib import admin
from .models import Seccion, Pregunta, Opcion, RespuestaEncuesta, DetalleRespuesta

class OpcionInline(admin.TabularInline):
    model = Opcion
    extra = 2

@admin.register(Seccion)
class SeccionAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'orden', 'activa')
    list_display_links = ('id', 'nombre')
    list_editable = ('orden', 'activa')
    search_fields = ('nombre', 'descripcion')

@admin.register(Pregunta)
class PreguntaAdmin(admin.ModelAdmin):
    list_display = ('id', 'orden', 'enunciado', 'tipo', 'seccion', 'requerida', 'activa')
    list_display_links = ('id', 'enunciado')
    list_editable = ('orden', 'requerida', 'activa')
    list_filter = ('tipo', 'seccion', 'activa', 'requerida')
    search_fields = ('enunciado',)
    inlines = [OpcionInline]

class DetalleRespuestaInline(admin.TabularInline):
    model = DetalleRespuesta
    extra = 0
    readonly_fields = ('pregunta', 'valor_numerico', 'valor_texto', 'opciones_seleccionadas')
    can_delete = False

@admin.register(RespuestaEncuesta)
class RespuestaEncuestaAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre_participante', 'email_participante', 'fecha_envio', 'ip_origen')
    list_filter = ('fecha_envio',)
    search_fields = ('nombre_participante', 'email_participante', 'ip_origen')
    readonly_fields = ('fecha_envio', 'ip_origen', 'user_agent', 'nombre_participante', 'email_participante')
    inlines = [DetalleRespuestaInline]

@admin.register(DetalleRespuesta)
class DetalleRespuestaAdmin(admin.ModelAdmin):
    list_display = ('encuesta', 'pregunta', 'valor_numerico', 'valor_texto')
    list_filter = ('pregunta__tipo', 'pregunta')
    search_fields = ('valor_texto',)
