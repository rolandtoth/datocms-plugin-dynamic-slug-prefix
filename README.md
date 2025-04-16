# DatoCMS Dynamic Slug Prefix

## Global settings

```json
{
  "globalDomain": "https://store.pwc.de",
  "globalPrefixTemplate": "{GLOBAL_DOMAIN}/{LOCALE}/",
  "readonlyApiToken": "f8ca75782963871e2b548240679c00"
}
```

Mappings

```json
{
  "de-DE": "de",
  "en-DE": "en"
}
```

## Examples

```json
{
  "prefixTemplate": "{GLOBAL_DOMAIN}/{LOCALE}/{API_NAME=publicationsPage}"
}
```

```json
{
  "prefixTemplate": "{GLOBAL_DOMAIN}/{LOCALE}/{API_NAME=productsPage}/{PARENT=product.productSlug}"
}
```

## Changelog

### v0.2.0 - 2025-04-16

- fix: remove non-functional "env" config setting, always use the current DatoCMS environment
