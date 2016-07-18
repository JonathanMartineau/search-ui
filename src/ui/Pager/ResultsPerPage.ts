import {Component} from '../Base/Component';
import {IComponentBindings} from '../Base/ComponentBindings';
import {ComponentOptions} from '../Base/ComponentOptions';
import {Initialization} from '../Base/Initialization';
import {QueryEvents, IQuerySuccessEventArgs} from '../../events/QueryEvents'
import {analyticsActionCauseList, IAnalyticsPagerMeta, IAnalyticsActionCause} from '../Analytics/AnalyticsActionListMeta'
import {Assert} from '../../misc/Assert'
import {$$} from '../../utils/Dom'

export interface IResultsPerPageOptions {
  numberOfResults?: number[];
}

/**
 * This component attaches itself to a div and allows users to choose the number of results displayed per page.<br/>
 */
export class ResultsPerPage extends Component {
  static ID = 'ResultsPerPage';

  /**
   * The options for the ResultsPerPage
   * @componentOptions
   */
  static options: IResultsPerPageOptions = {
    /**
     * Specifies the possible values of the number of results to display per page.<br/>
     * The default value is 10, 25, 50, 100
     */
    numberOfResults: ComponentOptions.buildCustomListOption<number[]>(function (list: string[]) {
      return list.map(function (value) {
        return +value;
      });
    }, { defaultValue: ['10', '25', '50', '100'] })
  };

  private currentResultsPerPage: number;

  private list: HTMLElement;

  /**
   * Create a new ResultsPerPage<br/>
   * Render itself on every query success.
   * @param element HTMLElement on which to instantiate the page (Normally : a div)
   * @param options
   * @param bindings
   */
  constructor(public element: HTMLElement, public options?: IResultsPerPageOptions, bindings?: IComponentBindings) {
    super(element, ResultsPerPage.ID, bindings);
    this.options = ComponentOptions.initComponentOptions(element, ResultsPerPage, options);

    this.currentResultsPerPage = this.options.numberOfResults[0];
    this.queryController.options.resultsPerPage = this.currentResultsPerPage;

    this.bind.onRootElement(QueryEvents.querySuccess, (args: IQuerySuccessEventArgs) => this.handleQuerySuccess(args));
    this.bind.onRootElement(QueryEvents.queryError, () => this.handleQueryError());
    this.initComponent(element);
  }

  /**
   * Set the current number of reults per page, and execute a query.<br/>
   * Log the required analytics event (pagerResize by default)
   * @param resultsPerPage
   * @param analyticCause
   */
  public setResultsPerPage(resultsPerPage: number, analyticCause: IAnalyticsActionCause = analyticsActionCauseList.pagerResize) {
    Assert.exists(resultsPerPage);
    Assert.check(this.options.numberOfResults.indexOf(resultsPerPage) != -1);
    this.currentResultsPerPage = resultsPerPage;
    this.queryController.options.resultsPerPage = this.currentResultsPerPage;
    this.usageAnalytics.logCustomEvent<IAnalyticsPagerMeta>(analyticCause, { pagerNumber: this.queryController.options.page, currentResultsPerPage: this.currentResultsPerPage }, this.element);
    this.queryController.executeQuery({
      ignoreWarningSearchEvent: true,
      keepLastSearchUid: true,
      origin: this
    });
  }

  private initComponent(element: HTMLElement) {
    element.appendChild($$('span', {
      className: 'coveo-results-per-page-text'
    }, 'Results per page').el);
    this.list = $$('ul', {
      className: 'coveo-results-per-page-list'
    }).el;
    element.appendChild(this.list);
  }

  private handleQueryError() {
    this.reset();
  }

  private handleQuerySuccess(data: IQuerySuccessEventArgs) {
    this.reset();
    let numResultsList: number[] = this.options.numberOfResults;
    for (var i = 0; i < numResultsList.length; i++) {

      var listItem = $$('li', {
        className: 'coveo-results-per-page-list-item'
      });
      if (numResultsList[i] == this.currentResultsPerPage) {
        listItem.addClass('coveo-active');
      }

      ((resultsPerPage: number) => {
        listItem.on('click', () => {
          this.handleClickPage(numResultsList[resultsPerPage]);
        })
      })(i);

      listItem.el.appendChild($$('a', {
        className: 'coveo-results-per-page-list-item-text'
      }, numResultsList[i].toString()).el);
      this.list.appendChild(listItem.el);
    }
  }
  private handleClickPage(resultsPerPage: number) {
    Assert.exists(resultsPerPage);
    this.setResultsPerPage(resultsPerPage);
  }

  private reset() {
    $$(this.list).empty();
  }
}

Initialization.registerAutoCreateComponent(ResultsPerPage);
