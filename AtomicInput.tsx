 import * as React from 'react';

import AtomicInputValidationWrapper, { IWrapValid } from '@app/src/components/AtomicInputValidationWrapper/AtomicInputValidationWrapper';
import { injectIntl, InjectedIntl } from "react-intl";
import IInput from "../../models/IInput";
import ErrorMessagesView from "@app/src/components/ErrorMessagesView/ErrorMessagesView";

interface IIntl {
    intl: InjectedIntl;
}

export interface IAtomicInputProps extends IInput {
    value: string;
    change: (value: string) => void;
}

class AtomicInput extends React.Component<IAtomicInputProps & IWrapValid & IIntl, {}> {
    constructor(props: IAtomicInputProps & IWrapValid & IIntl) {
        super(props);

        this.changeHandler = this.changeHandler.bind(this);
    }

    public changeHandler(event: React.ChangeEvent<HTMLInputElement>) {
        this.props.change(event.target.value);
    };

    public toggleInputLayout(): JSX.Element {
        if (this.props.appendElement) {
            return (
                <div className="input-group">
                    <input
                        className={`form-control ${this.props.inputValidationClass}`}
                        value={this.props.value as string}
                        {...this.props.elementConfig}
                        placeholder={this.props.intl.formatMessage({
                            id: this.props.elementConfig.placeholder,
                        })}
                        disabled={!this.props.isEditMode}
                        onChange={this.changeHandler}
                    />
                    <div className='input-group-append'>
                        <span className="input-group-text">
                            {this.props.intl.formatMessage({
                                id: this.props.appendElement,
                                defaultMessage: this.props.appendElement,
                            })}
                        </span>
                    </div>
                </div>
            );
        } else {
            return (
                <input
                    className={`form-control ${this.props.inputValidationClass}`}
                    value={this.props.value as string}
                    {...this.props.elementConfig}
                    placeholder={this.props.intl.formatMessage({
                        id: this.props.elementConfig.placeholder,
                    })}
                    disabled={!this.props.isEditMode}
                    onChange={this.changeHandler}
                />
            );
        }
    }

    public render() {
        if (this.props.isHidden) {
            return null;
        }
        return (
            <>
                {this.toggleInputLayout()}

                <span
                    className="float-right text-dark"
                    hidden={!this.props.isEditMode}
                >
                    {this.props.maxLengthValidationValues}
                </span>
                <ErrorMessagesView touched={this.props.touched}
                              isEditMode={this.props.isEditMode}
                              errorMessagesArr={this.props.errorMessagesArr}/>
            </>
        );
    };
}

export default AtomicInputValidationWrapper(injectIntl(AtomicInput));
