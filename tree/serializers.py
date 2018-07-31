from rest_framework import serializers
from rest_framework_recursive.fields import RecursiveField

from . import models


class NodeSerializer(serializers.ModelSerializer):
    children = serializers.ListField(
        child=RecursiveField(read_only=True), source='get_children',
        read_only=True
    )
    title = serializers.CharField(source='test_field')

    class Meta:
        model = models.Node
        fields = ('id', 'title', 'children')
        read_only_fields = ('id', 'children')
