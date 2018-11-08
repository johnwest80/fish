export interface ISecurityLoginPost {
    username: string;
    password: string;
}

export interface ISecurityRegisterPost {
    username: string;
    email: string;
    password: string;
    name: string;
    locationId?: string;
    location?: {
        locationName: string;
        timezone: string;
        zipCode: string;
    };
}

export interface IValidationError {
    text: string;
}

export interface ISystemError {
    text: string;
}

export interface IPostResult {
    validationError?: IValidationError;
    systemError?: ISystemError;
}
