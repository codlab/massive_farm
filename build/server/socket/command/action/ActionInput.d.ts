export interface KeyValue {
    key: string;
    value: string | number | null;
}
export interface ActionInput {
    id: string;
    code: string;
    action: string;
    options: KeyValue[];
}
