import { extend } from './Util'
import * as React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import Bounds from './Bounds'
import ChartConfig from './ChartConfig'
import { SourceWithDimension } from './ChartData'

@observer
export default class SourcesTab extends React.Component<{ bounds: Bounds, chart: ChartConfig }> {
    @computed get bounds() {
        return this.props.bounds
    }

    @computed get sources() {
        return this.props.chart.data.sources
    }

    renderSource(source: SourceWithDimension) {
        const { dimension } = source
        const { variable } = dimension
        return <div className="datasource-wrapper">
            <h2>{variable.name}</h2>
            <table className="variable-desc">
                {variable.description && <tr><td>Variable description</td><td>{variable.description}</td></tr>}
                {variable.coverage && <tr><td>Variable geographic coverage</td><td>{variable.coverage}</td></tr>}
                {variable.timespan && <tr><td>Variable time span</td><td>{variable.timespan}</td></tr>}
                {dimension.unitConversionFactor !== 1 && <tr><td>Unit conversion factor for chart</td><td>{dimension.unitConversionFactor}</td></tr>}
            </table>
            <div dangerouslySetInnerHTML={{ __html: source.description }} />
        </div>
    }

    render() {
        const { bounds } = this

        return <div className="sourcesTab" style={extend(bounds.toCSS(), { position: 'absolute' })}>
            <div>
                <h2>Sources</h2>
                <div>
                    {this.sources.map(source => this.renderSource(source))}
                </div>
            </div>
        </div>
    }
}
