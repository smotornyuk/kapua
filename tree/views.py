from django.shortcuts import get_object_or_404
from rest_framework import generics, mixins
from rest_framework.response import Response

from . import models, serializers


def _find_common_parent(a, b):
    if a.is_sibling_of(b):
        return a.get_parent()

    elder, younger = sorted((a, b), key=lambda i: i.depth)
    for ancestor in elder.get_ancestors().reverse():
        if younger.is_descendant_of(ancestor):
            return ancestor


class NodeGeneralAPIView(generics.ListCreateAPIView):
    queryset = models.Node.get_root_nodes()
    serializer_class = serializers.NodeSerializer

    def perform_create(self, instance):
        models.Node.add_root(test_field=instance.data['title'])


class NodeSingleAPIView(
        mixins.CreateModelMixin, generics.RetrieveUpdateDestroyAPIView
):
    queryset = models.Node.objects.all()
    serializer_class = serializers.NodeSerializer
    http_method_names = generics.GenericAPIView.http_method_names + ['move']

    def post(self, request, pk):
        return self.create(request, pk)

    def perform_create(self, instance):
        return self.get_object().add_child(test_field=instance.data['title'])

    def delete(self, request, pk):
        self.get_object().delete()
        return Response({'success': True})

    def move(self, request, pk):
        node = self.get_object()

        sibling = get_object_or_404(
            self.queryset, pk=request.data.get('sibling')
        )
        common_parent = _find_common_parent(node, sibling)

        position = request.data.get('position', 'right')

        node.move(sibling, position)

        if common_parent:
            serializer = self.get_serializer(common_parent)

        else:
            queryset = models.Node.get_root_nodes()
            serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
