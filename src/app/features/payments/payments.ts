export interface Fee {
    feeID: string
    name: string;
    type: TypeOfFee,
    value: number
}

export enum TypeOfFee {
    PerMeter = "Za metr",
    PerGardenPlot = "Za działke"
}

export interface Payments {
    leaseFees: Fee[];
    utilityFees: Fee[];
    additionalFees: Fee[];
    date: Date;
}

export interface IndividualPayment {
    paymentID: string
    name: string,
    value: number,
    date: Date
}

export interface IndividualPayments {
    userID: string,
    paymentsList?: IndividualPayment[]
}
