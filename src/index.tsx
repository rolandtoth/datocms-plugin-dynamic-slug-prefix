import {
  connect,
  IntentCtx,
  OnBootCtx,
  RenderConfigScreenCtx,
  RenderFieldExtensionCtx,
  RenderManualFieldExtensionConfigScreenCtx,
} from "datocms-plugin-sdk";
import { render } from "./utils/render";
import "datocms-react-ui/styles.css";
import React from "react";
import ReactDOM from "react-dom";
import ConfigScreen from "./entrypoints/ConfigScreen";
import DynamicSlugPrefix from "./components/DynamicSlugPrefix";
import FieldConfigScreen from "./entrypoints/FieldConfigScreen";
import {PLUGIN_ID, PLUGIN_NAME} from "./constants";

connect({
  renderConfigScreen(ctx: RenderConfigScreenCtx) {
    ReactDOM.render(
      <React.StrictMode>
        <ConfigScreen ctx={ctx} />
      </React.StrictMode>,
      document.getElementById('root'),
    );
  },

  manualFieldExtensions(ctx: IntentCtx) {
    return [
      {
        id: PLUGIN_ID,
        name: PLUGIN_NAME,
        type: "editor",
        fieldTypes: ["slug"],
        configurable: true,
      },
    ];
  },

  renderFieldExtension(fieldExtensionId: string, ctx: RenderFieldExtensionCtx) {
    switch (fieldExtensionId) {
      case PLUGIN_ID:
        return render(<DynamicSlugPrefix ctx={ctx} />);
      default:
        return null;
    }
  },

  renderManualFieldExtensionConfigScreen(
    _fieldExtensionId: string,
    ctx: RenderManualFieldExtensionConfigScreenCtx,
  ) {
    render(<FieldConfigScreen ctx={ctx}/>);
  },

  async onBoot(ctx: OnBootCtx) {
    // if we already performed the migration, skip
    if (ctx.plugin.attributes.parameters.migratedFromLegacyPlugin) {
      return;
    }

    // if the current user cannot edit fields' settings, skip
    if (!ctx.currentRole.meta.final_permissions.can_edit_schema) {
      return;
    }

    // get all the fields currently associated to the plugin...
    const fields = await ctx.loadFieldsUsingPlugin();

    // ... and for each of them...
    await Promise.all(
      fields.map(async (field: any) => {
        // set the fieldExtensionId to be the new one
        await ctx.updateFieldAppearance(field.id, [
          {
            operation: "updateEditor",
            newFieldExtensionId: PLUGIN_ID,
          },
        ]);
      })
    );

    // save in configuration the fact that we already performed the migration
    ctx.updatePluginParameters({
      ...ctx.plugin.attributes.parameters,
      migratedFromLegacyPlugin: true,
    });
  },
});
