# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from . import models
from . import serializers
from rest_framework import viewsets
from rest_framework import generics
# from django_filters.rest_framework import DjangoFilterBackend
from datetime import datetime
from django.utils import timezone
# import pytz
from rest_framework.response import Response
# from rest_framework.decorators import list_route
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework import status
from time import time
from .models import RadarImage, Radar
import sys, os
from dateutil import parser
import shutil

class RadarView(viewsets.ReadOnlyModelViewSet):
    """
    Devuelve un json con los datos de los radares.
    _____________________________________________

    Si desea una lista, consulte la url: /radar_api/radares/return_codes

    """
    serializer_class = serializers.RadarSerializer

    @action(detail=False, methods=['get'], url_path='return_codes')
    def return_codes(self, request, pk=None):
        """
        *This method return a list of radar codes
        """
        queryset = models.Radar.objects.all().values_list('code')
        ret = []
        for radar in queryset:
            ret.append(radar[0])
        return Response(ret)

    @action(detail=False, methods=['get'], url_path='return_active_codes')
    def return_active_codes(self, request, pk=None):
        """
        *This method return a list of active radar codes
        """
        queryset = models.Radar.objects.filter(is_active=True).values_list('code')
        ret = []
        for radar in queryset:
            ret.append(radar[0])
        return Response(ret)

    def get_queryset(self):
        queryset = models.Radar.objects.all()
        return queryset


class MinRadarProductView(viewsets.ReadOnlyModelViewSet):
    """
    Devuelve un json con los datos de los productos de radar.
    _____________________________________________

    Si desea una lista, consulte la url: /radar_api/radares_prod/return_keys

    """
    serializer_class = serializers.MinRadarProductSerializer

    @action(detail=False, methods=['get'], url_path='return_keys')
    def return_codes(self, request, pk=None):
        """
        *This method return a list of radar products codes
        """
        queryset = models.RadarProduct.objects.filter(enabled=True).values_list('product_key')
        ret = []
        for rp in queryset:
            ret.append(rp[0])
        return Response(ret)

    def get_queryset(self):
        queryset = models.RadarProduct.objects.all()
        return queryset


class EstrategiasView(viewsets.ReadOnlyModelViewSet):
    serializer_class = serializers.EstrategiaSerializer

    def get_queryset(self):
        queryset = models.Estrategia.objects.all()
        return queryset


class RadarImageView(viewsets.ModelViewSet):
    serializer_class = serializers.RadarImageSerializer

    def get_queryset(self):
        # /api_radares/radaresImage?date_from=2017-07-07 17:41&date_to=2017-07-07 17:50&polarimetric_var=TV&code_radar=234
        # mas o menos asi va la url
        queryset = models.RadarImage.objects.filter(show_me=True)
        date_from, date_to = None, None
        try:
            date_from = datetime.strptime(self.request.query_params.get('date_from', None), "%Y-%m-%d %H:%M") # type: ignore
            date_to = datetime.strptime(self.request.query_params.get('date_to', None), "%Y-%m-%d %H:%M") # type: ignore
        except:
            pass
        polarimetric_var = self.request.query_params.get('polarimetric_var', None) # type: ignore
        code_radar = self.request.query_params.get('code_radar', None) # type: ignore
        if polarimetric_var is not None:
            queryset = queryset.filter(polarimetric_var__in=polarimetric_var.split('-'))
        if code_radar is not None:
            queryset = queryset.filter(radar_id=code_radar)
        if (date_from and date_to) is not None:
            print(date_from, date_to)
            queryset = queryset.filter(date__range=(timezone.make_aware(date_from, timezone.get_default_timezone()), # type: ignore
                                                    timezone.make_aware(date_to, timezone.get_default_timezone()))) # type: ignore
            print(queryset)
        return queryset


class AddImagesView(APIView):
    def get(self, request, *args, **kw):
        # TODO: CUANDO LOS RADARES NO ESTAN ACTiVOS, EL SHOWME (de RadarImage) ESTA EN FALSE
        # New images RMA5_9005_03_20170727T200850Z_1.98_COLMAX.png

        start_time = time()
        objs = []
        # source es donde se encuentran las imagenes
        source = "/import_images/"
        # media_path es donde esta el path del media
        media_path = "/app/website/media/radares/images"
        count_files = 0
        for path, subdirs, files in os.walk(source):
            for name in files:
                if name.endswith(".png"):
                    count_files += 1
                    #RMA5_9005_03_20170727T200850Z_1.98_COLMAX.png
                    radar_code, strategy, scanning, date, sweep, polarimetric_var = name.split("_")
                    try:
                        radar = Radar.objects.get(code=radar_code)
                        if radar.is_active:
                            show = True
                        else:
                            show = False
                    except:
                        show = False
                    dt = parser.parse(date)
                    # Copy image
                    folder = os.path.join(str(radar_code), str(dt.year), str(dt.month), str(dt.day), name)
                    new_path = os.path.join(media_path, folder)
                    old_path = os.path.join(path, name)
                    shutil.move(old_path, new_path)
                    radar_image = RadarImage(radar=radar,
                                             image=os.path.join("radares/images", folder),
                                             polarimetric_var=polarimetric_var.replace(".png", ""),
                                             date=dt,
                                             strategy=strategy,
                                             scanning=scanning,
                                             sweep=sweep,
                                             show_me=show
                                             )
                    objs.append(radar_image)
                    #                    if len(objs) == 999:
                    #                        RadarImage.objects.bulk_create(objs)
                    #                        del objs[:]
        RadarImage.objects.bulk_create(objs)
        del objs[:]
        elapsed_time = time() - start_time
        print("Listo. Elapsed time: {:0.10f} minutos. Archivos: {}".format(elapsed_time / 60, count_files))

        response = Response("Listo. Elapsed time: {:0.10f} minutos. Archivos: {}".format(elapsed_time / 60, count_files), status=status.HTTP_200_OK)
        return response


class AddOLDImagesView(APIView):
    def get(self, request, *args, **kw):
        # TODO: CUANDO LOS RADARES NO ESTAN ACTiVOS, EL SHOWME (de RadarImage) ESTA EN FALSE
        # New images RMA5_9005_03_20170727T200850Z_1.98_COLMAX.png

        start_time = time()
        objs = []
        # source es donde se encuentran las imagenes
        source = "/app/website/media/radares/images"
        # media_path es donde esta el path del media
        media_path = "/app/website/media/radares/historic_images"
        count_files = 0
        for path, subdirs, files in os.walk(source):
            for name in files:
                if name.endswith(".png"):
                    count_files += 1
                    #RMA5_9005_03_20170727T200850Z_1.98_COLMAX.png
                    #Colmax_RMA1_0117_01_TH_20170228T141917Z.png
                    error = True
                    try:
                        colmax, radar_code, strategy, scanning, polarimetric_var, date = name.split("_")
                        try:
                            radar = Radar.objects.get(code=radar_code)
                            if radar.is_active:
                                show = True
                            else:
                                show = False
                        except:
                            show = False
                        dt = parser.parse(date.replace(".png", ""))
                        # Copy image
                        folder = os.path.join(str(radar_code), str(dt.year), str(dt.month), str(dt.day), name)
                        new_path = os.path.join(media_path, folder)
                        old_path = os.path.join(path, name)
                        print(old_path)
                        print(new_path)
                        error = False
                    except:
                        print(name.split("_"))

                    if not error:
                        os.renames(old_path, new_path)
                        #shutil.move(old_path, new_path)
                        radar_image = RadarImage(radar=radar,
                                                 image=os.path.join("radares/images", folder),
                                                 polarimetric_var='COLMAX', #polarimetric_var.replace(".png", ""),
                                                 date=dt,
                                                 strategy=strategy,
                                                 scanning=scanning,
                                                 sweep=0,
                                                 show_me=show
                                                 )
                        objs.append(radar_image)
                        #                    if len(objs) == 999:
                        #                        RadarImage.objects.bulk_create(objs)
                        #                        del objs[:]
        RadarImage.objects.bulk_create(objs)
        del objs[:]
        elapsed_time = time() - start_time
        print("Listo. Elapsed time: {:0.10f} minutos. Archivos: {}".format(elapsed_time / 60, count_files))

        response = Response("Listo. Elapsed time: {:0.10f} minutos. Archivos: {}".format(elapsed_time / 60, count_files), status=status.HTTP_200_OK)
        return response
