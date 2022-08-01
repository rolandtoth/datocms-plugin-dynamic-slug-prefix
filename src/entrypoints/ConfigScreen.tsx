import { RenderConfigScreenCtx } from 'datocms-plugin-sdk';
import {
  Button,
  Canvas,
  Form,
  FieldGroup,
} from 'datocms-react-ui';
import { useState, useCallback } from 'react';
import { Form as FormHandler } from 'react-final-form';
import JsonTextarea from '../components/JsonTextarea';
import { validateGlobalSettings, validateMappings } from '../lib/validators';
import s from '../lib/styles.module.css';

type PropTypes = {
  ctx: RenderConfigScreenCtx;
};

type Parameters = {
  globalSettings: string;
  mappings: string;
};

type State = {
  parameters: Parameters;
  valid: boolean;
};

const defaultParameters: Parameters = {
  globalSettings: "{}",
  mappings: "{}",
};

export default function ConfigScreen({ ctx }: PropTypes) {
  const [state, setState] = useState<State>({
		parameters: ctx.plugin.attributes.parameters as Parameters,
		valid: false,
	});

	const handleOnChange = useCallback((partialParameters: Partial<Parameters>) => {
		setState((current) => ({
			valid: true,
			parameters: {
        ...current.parameters,
				...partialParameters,
			},
		}));
	}, []);

	const handleOnError = useCallback(() => {
		setState(current => ({
			...current,
			valid: false,
		}));
	}, []);

  return (
    <Canvas ctx={ctx}>
      <FormHandler<Parameters>
        initialValues={ctx.plugin.attributes.parameters}
        onSubmit={async () => {
          await ctx.updatePluginParameters(state.parameters);
          setState(current => ({
            ...current,
            valid: false,
          }));
          ctx.notice('Settings updated successfully!');
        }}
      >
        {({ handleSubmit, submitting }) => (
          <Form onSubmit={handleSubmit}>
            <FieldGroup>
              <>
                <label className={s["form-label"]}>Global Settings</label>
                <JsonTextarea
                  label="Global Settings"
                  initialValue={state.parameters.globalSettings || defaultParameters.globalSettings}
                  validate={validateGlobalSettings}
                  onValidChange={(value) => handleOnChange({ globalSettings: value})}
                  onError={handleOnError}
                />

                <label className={s["form-label"]}>Mappings</label>
                <JsonTextarea
                  label="Mapping"
                  initialValue={state.parameters.mappings || defaultParameters.mappings}
                  validate={validateMappings}
                  onValidChange={(value) => handleOnChange({ mappings: value})}
                  onError={handleOnError}
                />
              </>
            </FieldGroup>
            <Button
              type="submit"
              fullWidth
              buttonSize="l"
              buttonType="primary"
              disabled={submitting || !state.valid}
            >
              Save settings
            </Button>
          </Form>
        )}
      </FormHandler>
    </Canvas>
  );
}
