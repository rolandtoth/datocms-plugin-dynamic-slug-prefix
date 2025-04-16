import { isArray, isObject, isString } from 'remeda';
import lang, {
	EN_FIELD_IS_NOT_STRING_ARRAY,
	EN_OPTION_MISSING_FIELD, EN_OPTION_NON_STRING_FIELD,
	EN_OPTION_DATA_NOT_OBJECT,
} from '../lang';
import type { Result } from './types';

const VALID_GLOBAL_OPTION_KEYS = ['globalDomain', 'globalPrefixTemplate', 'readonlyApiToken'];

const error = (message: string): Result => ({
	type: 'error',
	message,
});

const validateFieldSettings = (data: unknown): Result => {
	if (!isObject(data)) {
		return error(lang(EN_OPTION_DATA_NOT_OBJECT));
	}

	return {
		type: 'success',
	};
};

const validateGlobalSettings = (data: unknown): Result => {
	if (!isObject(data)) {
		return error(lang(EN_OPTION_DATA_NOT_OBJECT));
	}

	for (let i = 0; i < VALID_GLOBAL_OPTION_KEYS.length; i++) {
		const value = data[VALID_GLOBAL_OPTION_KEYS[i]];

		if (value === undefined) {
			return error(lang(EN_OPTION_MISSING_FIELD, { field: VALID_GLOBAL_OPTION_KEYS[i] }));
		}

		if (!isString(value)) {
			return error(lang(EN_OPTION_NON_STRING_FIELD, { field: VALID_GLOBAL_OPTION_KEYS[i] }));
		}
	}

	return {
		type: 'success',
	};
};

const validateArray = (data: unknown): Result => {
	if (!isArray(data)) {
		return error(lang(EN_FIELD_IS_NOT_STRING_ARRAY, { field: 'GeneralOptions' }));
	}

	return {
		type: 'success',
	};
};

const validateMappings = (data: unknown): Result => {
	if (!isObject(data)) {
		return error(lang(EN_OPTION_DATA_NOT_OBJECT));
	}

	return {
		type: 'success',
	};
};

export {
	validateFieldSettings,
	validateArray,
	validateGlobalSettings,
	validateMappings,
};
