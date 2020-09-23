import * as React from 'react';
import { addLocaleData, IntlProvider } from 'react-intl';
import * as ru from 'react-intl/locale-data/ru';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as IntlComponentWrapActions from './IntlWrapComponent.actions';

import enTranslationMessages from '../../translations/en.json';
import ruTranslationMessages from '../../translations/ru.json';

addLocaleData([...ru]);

interface ILocaleProps{
  currentLocale: string,
  messages: object,
  IntlComponentWrapActions: any,
  en: object,
  ru: object
}

class IntlComponentWrap extends React.Component<ILocaleProps, {}>{
  public render() {
    return <IntlProvider locale={this.props.currentLocale}
                         messages={this.props[this.props.currentLocale]}
                         key={this.props.currentLocale}>
      {this.props.children}
    </IntlProvider>
  }
}

function mapStateToProps(state: any) {
  return {
    currentLocale: state.localeReducer.currentLocale,
    en: enTranslationMessages,
    messages: state.localeReducer.messages,
    ru: ruTranslationMessages,
  }
}

function mapDispatchToProps(dispatch: any) {
  return {
    IntlComponentWrapActions: bindActionCreators(IntlComponentWrapActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(IntlComponentWrap)
