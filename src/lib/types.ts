type Result = {
	type: 'error';
	message: string;
} | {
	type: 'success';
};

export type {
	Result,
};

export interface GlobalSettings {
	globalDomain: string;
	globalPrefixTemplate: string;
	env: string;
	readonlyApiToken: string;
}

export type FieldLevelSettings = {
	prefixTemplate: string;
}

export type Mapping = {[key: string] : string};