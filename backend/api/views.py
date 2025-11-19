from django.shortcuts import render
from django.http import JsonResponse

# Create your views here.
def test_endpoint(request):
    return JsonResponse({
        'user': 'johndoe123', 
        'gender': 'Male'
    })