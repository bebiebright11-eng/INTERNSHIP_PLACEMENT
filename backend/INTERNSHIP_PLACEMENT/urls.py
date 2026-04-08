from django.contrib import admin
from django.urls import path, include
from django.conf import settings 
from django.conf.urls.static import static
from django.http import HttpResponse


def home(request):
    return HttpResponse("welcome to the internship Placement API!")

admin.site.site_header = "Internship Placement System"
admin.site.site_title = "Internship Admin"
admin.site.index_title = "Welcome to Internship Dashboard"

urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),

    path('api/accounts/', include('accounts.urls')),
    
    path('api/internships/',include('internships.urls')),

    path ( 'api/supervision/',include('supervision.urls')),
] 
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root = settings.MEDIA_ROOT)