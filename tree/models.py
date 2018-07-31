from django.db import models
from treebeard.ns_tree import NS_Node
# Create your models here.


class Node(NS_Node):
    test_field = models.CharField(max_length=100)

    def __str__(self):
        return '{}'.format(self.test_field)
