# DatoCMS Dynamic Slug Prefix

## Global settings

```json
{
  "globalDomain": "https://store.pwc.de",
  "globalPrefixTemplate": "{GLOBAL_DOMAIN}/{LOCALE}/",
  "env": "",
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
