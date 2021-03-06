import * as React from 'react'
import { sum, includes, max } from './Util'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import TextWrap from './TextWrap'
import { defaultTo } from './Util'
import Bounds from './Bounds'

export interface ScatterColorLegendProps {
    maxWidth: number,
    colors: string[],
    scale: d3.ScaleOrdinal<string, string>
}

export interface LabelMark {
    label: TextWrap,
    color: string,
    width: number,
    height: number
}

export default class ScatterColorLegend {
    props: ScatterColorLegendProps
    constructor(props: ScatterColorLegendProps) {
        this.props = props
    }

    @computed get fontSize(): number { return 0.7 }
    @computed get rectSize(): number { return Bounds.baseFontSize / 3 }
    @computed get rectPadding(): number { return 5 }
    @computed get lineHeight(): number { return 5 }

    @computed get labelMarks(): LabelMark[] {
        const { props, fontSize, rectSize, rectPadding } = this

        return props.scale.domain().map(value => {
            const color = props.scale(value)
            if (props.colors.indexOf(color) === -1)
                return null

            const label = new TextWrap({ maxWidth: props.maxWidth, fontSize: fontSize, text: value })
            return {
                label: label,
                color: color,
                width: rectSize + rectPadding + label.width,
                height: Math.max(label.height, rectSize)
            }
        }).filter(v => !!v) as LabelMark[]
    }

    @computed get width(): number {
        if (this.labelMarks.length === 0)
            return 0
        else
            return defaultTo(max(this.labelMarks.map(d => d.width)), 0)
    }

    @computed get height() {
        return sum(this.labelMarks.map(d => d.height)) + this.lineHeight * this.labelMarks.length
    }
}

export interface ScatterColorLegendViewProps {
    x: number,
    y: number,
    legend: ScatterColorLegend,
    activeColors: string[],
    focusColors?: string[],
    onMouseOver?: (color: string) => void,
    onClick?: (color: string) => void,
    onMouseLeave?: () => void
}

@observer
export class ScatterColorLegendView extends React.Component<ScatterColorLegendViewProps> {
    render() {
        const { props } = this
        const { focusColors, activeColors, onMouseOver, onMouseLeave, onClick } = props
        const { labelMarks, rectSize, rectPadding, lineHeight } = props.legend
        let offset = 0

        return <g className="ScatterColorLegend clickable" style={{ cursor: 'pointer' }}>
            {labelMarks.map(mark => {
                const isActive = includes(activeColors, mark.color)
                const isFocus = includes(focusColors, mark.color)
                const mouseOver = onMouseOver ? () => onMouseOver(mark.color) : undefined
                const mouseLeave = onMouseLeave || undefined
                const click = onClick ? () => onClick(mark.color) : undefined

                const result = <g className="legendMark" onMouseOver={mouseOver} onMouseLeave={mouseLeave} onClick={click} fill={!isActive ? "#ccc": undefined}>
                    <rect x={props.x} y={props.y + offset - lineHeight / 2} width={mark.width} height={mark.height + lineHeight} fill="#fff" opacity={0} />,
                    <rect x={props.x} y={props.y + offset + rectSize / 2} width={rectSize} height={rectSize} fill={isActive ? mark.color : undefined} />,
                    {mark.label.render(props.x + rectSize + rectPadding, props.y + offset, isFocus ? { style: { fontWeight: 'bold' } } : undefined)}
                </g>

                offset += mark.height + lineHeight
                return result
            })}
        </g>
    }
}
