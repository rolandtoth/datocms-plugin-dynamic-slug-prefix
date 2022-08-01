import {useState, useCallback} from 'react';
import {isString} from 'remeda';
import type {RenderManualFieldExtensionConfigScreenCtx} from 'datocms-plugin-sdk';
import {Canvas} from 'datocms-react-ui';
import JsonTextarea from '../components/JsonTextarea';
// import type {Result} from '../lib/types';
// import {EMPTY_LENGTH, JSON_INDENT_SIZE} from '../constants';
import lang, {EN_FIELD_CONFIGURATION} from '../lang';
import {validateFieldSettings} from '../lib/validators';

type FieldConfigScreenProps = {
    ctx: RenderManualFieldExtensionConfigScreenCtx;
};

type Parameters = {
	config: string;
};

const createInitialParameters = (
	ctx: RenderManualFieldExtensionConfigScreenCtx,
	parameters: Record<string, unknown>,
): Parameters => {
	if (isString(parameters.config) && parameters.config.length > 0) {
		return {
			config: parameters.config,
		};
	}

	const initialParameters = {
		config: JSON.stringify({
			prefixTemplate: "",
		}, null, 2),
	};

	ctx.setParameters(initialParameters);

	return initialParameters;
};

const formatParameters = (parameters: Parameters): Parameters => {
	const rawJson = parameters.config;

	return {
		config: JSON.stringify(JSON.parse(rawJson), null, 2),
	};
};

const FieldConfigScreen = ({ctx}: FieldConfigScreenProps): JSX.Element => {
	const [state, setState] = useState<Parameters>(createInitialParameters(ctx, ctx.parameters));
	// const [lastValidState, setLastValidState] = useState<Parameters>(state);

	const handleOnChange = useCallback((value: string) => {
		const newState = {
			config: value,
		};

		setState(newState);
	// 	setLastValidState(newState);

		ctx.setParameters(formatParameters(newState));
	}, []);

	// const handleOnError = useCallback((_result: Result) => {
	// 	ctx.setParameters(lastValidState);
	// }, []);

	// console.log("fieldConfigCtx", ctx);

	return (
		<Canvas ctx={ctx}>
			<JsonTextarea
				label={lang(EN_FIELD_CONFIGURATION)}
				initialValue={state.config}
				validate={validateFieldSettings}
				onValidChange={handleOnChange}
				// onError={handleOnError}
			/>
		</Canvas>
	);
};

export default FieldConfigScreen;
