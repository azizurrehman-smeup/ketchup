import { Component, Prop } from '@stencil/core';

declare const d3: any;

@Component({
  tag: 'kup-gauge',
  styleUrl: 'kup-gauge.scss',
  shadow: true,
})
export class KupGauge {
  /**
   * Sets how much the arc of the gauge should be thick.
   * @namespace kup-gauge.arcThickness
   * @see kup-gauge.size
   */
  @Prop() arcThickness = 30;
  /**
   * Array of three elements to specify the color of the arcs.
   */
  @Prop() colors: string[] = ['red', 'yellow', 'green'];
  /**
   * The first threshold, establishing the length of the first and second arc.
   */
  @Prop() firstThreshold: number = -50;
  /**
   * The maximum value reachable in the current graph.
   */
  @Prop() maxValue: number = 100;
  /**
   * A string which will be appended to the displayed values of the component.
   */
  @Prop() measurementUnit: string = '';
  /**
   * The minimum value reachable in the current graph.
   */
  @Prop() minValue: number = -100;
  /**
   * The second threshold, establishing the length of the second and third arc.
   */
  @Prop() secondThreshold: number = 50;
  /**
   * If set to false, the current value of the gauge is not displayed.
   */
  @Prop() showValue: boolean = true;
  /**
   * If set to false, the maximum, minimum and threshold values of the gauge are not displayed.
   */
  @Prop() showLabels: boolean = true;
  /**
   * Con be used change the viewbox of the SVG.
   * By manipulating this value, some customizations of the aspect of the gauge is achievable.
   * @namespace kup-gauge.size
   * @see kup-gauge.arcThickness
   */
  @Prop() size: number = 200;
  /**
   * The current value of the gauge.
   * The gauge's needle points to the percentage based on this prop.
   */
  @Prop() value: number = 0;

  /*
  Da prop: Valore, Max, Min, Soglia1 e Soglia2, Inversione colori, Mostra il valore, Mostra etichette.

  Da JSON: Valore, Max, Min, Soglia1 e Soglia2

  Non ha eventi.

  */

  //---- Internal not reactive state ----

  // Arcs generators
  private arc1 = d3.arc();
  private arc2 = d3.arc();
  private arc3 = d3.arc();

  /**
   * Holds the maximum positive interval.
   * Percentages are calculated as it follows:
   * MIN = 0 = the value the prop minValue gets transformed to\
   * MAX = ABSOLUTE(minValue - maxValue) = the maxValuePositive holds this value
   * TVALUE = value - minValue = any value, which needs to be represented on the chart
   * @namespace kup-gauge.maxValuePositive
   */
  private maxValuePositive = 0;

  //---- Utility functions ----
  // Manipulates and transforms degrees to percentage and vice versa.

  percToDeg(perc) {
    return perc * 360;
  };

  degToRad(deg) {
    return deg * Math.PI / 180;
  };

  percToRad(perc) {
    return this.degToRad(this.percToDeg(perc));
  };

  /**
   * Given a valid value, minValue <= value <= maxValue, calculates this value as a percentage of the interval [minValue, maxValue]
   * @param {number} valueToPercentage - The value to be calculated as a percentage
   * @see kup-gauge.maxValuePositive
   */
  calculateValuePercentage(valueToPercentage: number = 0): number {
    return (valueToPercentage - this.minValue) / this.maxValuePositive;
  }

  /**
   * Provided all the necessary data, returns the string necessary for a <path/> element to build the gauge needle.
   * @param needleLength - A pure number of viewbox units indicating the needle lenght.
   * @param needleBaseRadius - Sets the needle radius in viewbox units.
   * @param centerX - X coordinate of the center of the base needle.
   * @param centerY - Y coordinate of the center of the base needle.
   * @param rotationPercentage {number} - A percentage number setting the current rotation of the needle. (0 < rotationPercentage < 1)
   * @returns {string}
   */
  paintNeedle(needleLength: number, needleBaseRadius: number, centerX: number, centerY: number, rotationPercentage: number = 0): string {
    let leftX, leftY, rightX, rightY, thetaRad, topX, topY;
    thetaRad = this.percToRad(rotationPercentage / 2); // Since the gauge is a semicircle, we must divide the percentage in half
    topX = centerX - needleLength * Math.cos(thetaRad);
    topY = centerY - needleLength * Math.sin(thetaRad);
    leftX = centerX - needleBaseRadius * Math.cos(thetaRad - Math.PI / 2);
    leftY = centerY - needleBaseRadius * Math.sin(thetaRad - Math.PI / 2);
    rightX = centerX - needleBaseRadius * Math.cos(thetaRad + Math.PI / 2);
    rightY = centerY - needleBaseRadius * Math.sin(thetaRad + Math.PI / 2);
    return "M " + leftX + " " + leftY + " L " + topX + " " + topY + " L " + rightX + " " + rightY;
  }

  //---- Rendering functions ----
  valueTextFactory(text) {
    return <span class="gauge__value-text">{text + (this.measurementUnit ? ' ' + this.measurementUnit : '') }</span>;
  }

  render() {
    // mathematical operations
    this.maxValuePositive = Math.abs(this.minValue - this.maxValue);
    const firstThresholdPercentage = this.calculateValuePercentage(this.firstThreshold) * Math.PI; //Math.PI / 3
    const secondThresholdPercentage = this.calculateValuePercentage(this.secondThreshold) * Math.PI; // Math.PI / 3 * 2

    // Svg constants
    const halvedSize = this.size / 2; // The svg size ratio w : w / 2
    const needleCircleRadius = this.size / 16; // Arbitrary size of the base of the needle
    const needleLength = halvedSize - this.arcThickness / 2; // Calculates the length of the needle in pure units

    const a1 = this.arc1({
      innerRadius: halvedSize - this.arcThickness,
      outerRadius: halvedSize,
      startAngle: 0,
      endAngle: firstThresholdPercentage
    });
    const a2 = this.arc2({
      innerRadius: halvedSize - this.arcThickness,
      outerRadius: halvedSize,
      startAngle: firstThresholdPercentage,
      endAngle: secondThresholdPercentage
    });
    const a3 = this.arc3({
      innerRadius: halvedSize - this.arcThickness,
      outerRadius: halvedSize,
      startAngle: secondThresholdPercentage,
      endAngle: Math.PI
    });

    console.log(a1, halvedSize)

    return [
      <div>
        <svg viewBox={`0 0 ${this.size} ${halvedSize + needleCircleRadius}`}>
          <g transform={`rotate(-90) translate(-${halvedSize}, ${halvedSize})`}>
            <path d={a1} style={{ fill: this.colors[0] }}/>
            <path d={a2} style={{ fill: this.colors[1] }}/>
            <path d={a3} style={{ fill: this.colors[2] }}/>
          </g>
          <circle
            class="gauge__needle-base"
            cx={halvedSize}
            cy={halvedSize}
            r={needleCircleRadius}/>
          <path
            class="gauge__needle"
            d={this.paintNeedle(needleLength, needleCircleRadius, halvedSize, halvedSize, this.calculateValuePercentage(this.value))}
          />
        </svg>
      </div>,
      <div class="gauge__bottom-container">
        {this.showLabels ? this.valueTextFactory(this.minValue): null}
        {this.showValue ? this.valueTextFactory(this.value): null}
        {this.showLabels ? this.valueTextFactory(this.maxValue): null}
      </div>
    ];
  }
}
