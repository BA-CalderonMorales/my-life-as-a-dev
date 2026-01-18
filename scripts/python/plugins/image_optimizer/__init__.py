"""
Image Optimizer Plugin for MkDocs/Zensical

A build-time image optimization plugin that:
- Converts images to modern formats (WebP, AVIF)
- Generates responsive image sizes
- Creates low-quality image placeholders (LQIP)
- Adds lazy loading attributes to HTML

Designed for optimal performance on all devices, including low-powered
devices like Samsung Fridge smart screens.

Architecture:
- Domain: Core models and business logic (SOLID SRP)
- Infrastructure: Format converters and processors (OCP)
- Presentation: HTML output transformation

Author: Brandon A. Calderon Morales
"""

from .plugin import ImageOptimizerPlugin

__all__ = ["ImageOptimizerPlugin"]
__version__ = "1.0.0"
