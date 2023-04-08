import { RenderFieldExtensionCtx } from "datocms-plugin-sdk";
import { FC, useEffect, useRef, useState } from "react";
import get from "lodash/get";
import { Canvas } from "datocms-react-ui";
import { setLastCharacter } from "../utils/helpers";
import s from '../lib/styles.module.css';
import {FIELD_TOKENS} from "../constants";
import {FieldLevelSettings, GlobalSettings, Mapping} from "../lib/types";
var slug = require('slug');

type PropTypes = {
  ctx: RenderFieldExtensionCtx;
};

const DynamicSlugPrefix: FC<PropTypes> = ({ ctx }) => {
  const [prefix, setPrefix] = useState("");
  const initialValue = get(ctx?.formValues, ctx?.fieldPath || "");

  const fieldSettings = useRef<FieldLevelSettings>(JSON.parse(ctx.field.attributes.appearance.parameters.config as string) as FieldLevelSettings);

  const mappings = useRef<Mapping>(JSON.parse(ctx.plugin.attributes.parameters.mappings as string) as Mapping);

  const globalSettings = useRef<GlobalSettings>(JSON.parse(ctx.plugin.attributes.parameters.globalSettings as string) as GlobalSettings);

  useEffect(() => {
    const fetchMyData = async () => {
      const prefix = await getPrefix();
      setPrefix(prefix);
    };
    fetchMyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // https://github.com/Trott/slug/issues/289
  slug.charmap["_"] = "_";
  const slugifyConfig = {
    lower: true,
    trim: false,
    strict: false,
  };

  const handleOnBlur = (value: string) => {
    // keep only the last "_" (allows further writing)
    // the default "-" is allowed to enter only once
    value = value.replace(/_(_)+$/, "_");
    // replace "-_" or "_-"
    value = value.replace(/_(-)+/g, "_");
    value = value.replace(/-(_)+/g, "-");

    value = slug(value, slugifyConfig);

    // DatoCMS can't let save if slug ends with "_" or "-"
    value = value.replace(/[-_]*$/, "");
    ctx.setFieldValue(ctx.fieldPath, value);
  };

  function getPrefixTemplate(): string {
    return fieldSettings.current.prefixTemplate || globalSettings.current.globalPrefixTemplate || "";
  }

  function getTokenValueFromPrefixTemplate(template: string, identifier: string): string {
    const regex = new RegExp(`{${identifier}=([^}]*)}`);
    const match = template.match(regex);

    return match && match.length === 2 ? match[1] : "";
  }

  async function getPrefix() {
    const isLocalizedField: boolean = ctx.field.attributes.localized;
    let prefix: string = getPrefixTemplate();

    if (isLocalizedField && prefix.includes(`${FIELD_TOKENS.locale}`)) {
      prefix = prefix.replace(`{${FIELD_TOKENS.locale}}`, getMappedValue(ctx.locale) || "");
    }

    if (prefix.includes(`${FIELD_TOKENS.globalDomain}`)) {
      prefix = prefix.replace(`{${FIELD_TOKENS.globalDomain}}`, globalSettings.current.globalDomain || "");
    }

    // TODO:
    // multiple parents?
    // set which field "eg. productsPage.slug" - do not query _allSlugLocales but the field (with locale)
    const apiName = getTokenValueFromPrefixTemplate(prefix, FIELD_TOKENS.apiName);
    if (apiName) {
        let query = isLocalizedField
          ? `
          {
            ${apiName} {
              _allSlugLocales {
                locale
                value
              }
            }
          }`
          : `
          {
            ${apiName} {
              slug
            }
          }`;

        const { data: apiResponse } = await fetch(`https://graphql.datocms.com/${globalSettings.current.env}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${globalSettings.current.readonlyApiToken}`,
            "X-Include-Drafts": 'true',
          },
          body: JSON.stringify({ query }),
        }).then(res => res.json());

        let slug;

        if (isLocalizedField) {
          const locale = ctx.locale.replace("-", "_");
          slug = apiResponse[apiName]._allSlugLocales.find((x: any) => x.locale.toLowerCase() === locale.toLowerCase())?.value;
        } else {
          slug = apiResponse.slug;
        }

        const parent = getTokenValueFromPrefixTemplate(prefix, FIELD_TOKENS.parent);

        if (parent) {
          const parentId = ctx.item?.attributes.parent_id;
          const [ parentApiName, parentSlugName ] = parent.split(".");
          const allSlugLocales = `_all${parentSlugName.charAt(0).toUpperCase()}${parentSlugName.slice(1)}Locales`;

          if (parentId) {
            let query = isLocalizedField
            ? `
            {
              ${parentApiName}(filter: { id: { eq: ${parentId} }}) {
                ${allSlugLocales} {
                  locale
                  value
                }
              }
            }`
            : `
            {
              ${parentApiName}(filter: { id: {eq: ${parentId}} }) {
                ${parentSlugName}
              }
            }`;

            const { data: parentApiResponse } = await fetch(`https://graphql.datocms.com/${globalSettings.current.env}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${globalSettings.current.readonlyApiToken}`,
                "X-Include-Drafts": 'true',
              },
              body: JSON.stringify({ query }),
            }).then(res => res.json());

            let parentSlug;

            if (isLocalizedField) {
              const locale = ctx.locale.replace("-", "_");
              parentSlug = parentApiResponse[parentApiName][allSlugLocales].find((x: any) => x.locale.toLowerCase() === locale.toLowerCase())?.value;
            } else {
              parentSlug = parentApiResponse[parentSlugName];
            }

            slug = parentSlug;
          }
          prefix = prefix.replace(`{${FIELD_TOKENS.parent}=${parentApiName}.${parentSlugName}}`, "");
        }

        prefix = prefix.replace(`{${FIELD_TOKENS.apiName}=${apiName}}`, slug || "");
    }

    return setLastCharacter(prefix, "/");
  }

  function getMappedValue(key: string): string {
    return mappings.current?.[key] || key;
  }

  return (
    <Canvas ctx={ctx}>
      <div className={s["dynamic-slug-prefix__wrapper"]}>
        <span className={s["dynamic-slug-prefix__prefix"]}>
          {prefix}
        </span>
        <input
          className={s["dynamic-slug-prefix__input"]}
          onBlur={(e) => handleOnBlur(e.currentTarget.value)}
          name={ctx.fieldPath}
          defaultValue={initialValue as string}
          autoComplete="off"
        />
      </div>
    </Canvas>
  );
};

export default DynamicSlugPrefix;
