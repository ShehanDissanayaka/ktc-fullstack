from django import template

register = template.Library()

@register.filter
def multiply(value, arg):
    """Multiply value by arg and return the result."""
    try:
        return float(value) * float(arg)
    except (ValueError, TypeError):
        return 0
