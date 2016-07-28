import {ComponentOptions} from '../Base/ComponentOptions';
import {IAdvancedSearchInput} from './AdvancedSearchInput';
import {l} from '../../strings/Strings';
import {$$} from '../../utils/Dom'

export class KeywordsInput implements IAdvancedSearchInput {

  protected element: HTMLElement

  constructor(public sectionName: string) {
  }

  public buildInput(): HTMLElement {
    let sectionClassName = 'coveo-advanced-search-keyword coveo' + ComponentOptions.camelCaseToHyphen(this.sectionName).toLowerCase();
    let keyword = $$('div', { className: sectionClassName });
    let label = $$('span', { className: 'coveo-advanced-search-label' });
    let input = $$('input', { className: 'coveo-share-query-summary-info-input coveo-advanced-search-input' });
    label.text(l(this.sectionName + 'Label'));
    keyword.append(label.el);
    keyword.append(input.el);
    this.element = keyword.el;
    return this.element;
  }

  public getValue(): string {
    let input = <HTMLInputElement>$$(this.element).find('input');
    return input.value;
  }

  public clear() {
    let input = <HTMLInputElement>$$(this.element).find('input');
    input.value = '';
  }
}

export class AllKeywordsInput extends KeywordsInput {
  constructor() {
    super('AdvancedSearchAll')
  }
}

export class ExactKeywordsInput extends KeywordsInput {
  constructor() {
    super('AdvancedSearchExact')
  }

  public getValue(): string {
    let value = super.getValue();
    return value ? '\"' + value + '\"' : '';
  }
}

export class AnyKeywordsInput extends KeywordsInput {
  constructor() {
    super('AdvancedSearchAny')
  }

  public getValue(): string {
    let value = super.getValue();
    let splitValues = value.split(' ');
    let generatedValue = '';
    _.each(splitValues, (splitValue) => {
      generatedValue += splitValue + ' OR '
    })
    generatedValue = generatedValue.substr(0, generatedValue.length - 4);
    return generatedValue;
  }
}

export class NoneKeywordsInput extends KeywordsInput {
  constructor() {
    super('AdvancedSearchNone')
  }

  public getValue(): string {
    let value = super.getValue();
    let generatedValue = '';

    if (value) {
      let splitValues = value.split(' ');
      _.each(splitValues, (splitValue) => {
        generatedValue += ' NOT ' + splitValue
      })
      generatedValue = generatedValue.substr(1);
    }

    return generatedValue;
  }
}