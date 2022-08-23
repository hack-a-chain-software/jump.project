import BN from "bn.js";
import { MAX_NUM } from "./constants";

// TODO: test this
export type BigDecimalFloatFormatOptions = Intl.NumberFormatOptions &
  BigIntToLocaleStringOptions;

export type FormatQuotientOptions = {
  precision?: BN;
  /* unit
   *     Note that the unit field in this type is not the same as the one present inside formatOptions.
   * The Intl API uses the unit codes defined by Unicode. This unit field is meant to be used as a suffix
   * separated by a whitespace character from the formatted output, so we can use it for token symbols.
   */
  unit?: string;
  formatOptions: BigDecimalFloatFormatOptions;
};

const toSafeNumber = (a: BN) =>
  a.gt(MAX_NUM)
    ? BigInt(a.toString()) // I don't like it either
    : a.toNumber();

/* BigDecimalFloat
 *     A type that simulates a float but with BigNumber-typed (arbitrary-size) mantissa and 10 as the exponent base instead of 2.
 * This creates a type which supports arbitrary-precision operations with numbers that can be naturally expressed in scientific notation
 * e.g. 3.25e3 = { mantissa: 325, exponent: 1 } = { mantissa: 3250, exponent: 0 } = 3250
 * note that this representation is thus not unique, and opposed to IEEE floats, we make no attempts to normalize it after
 * operations.
 */
export class BigDecimalFloat {
  constructor(private mantissa: BN, private exponent: BN = new BN(0)) {}

  toLocaleString(
    locale: Intl.LocalesArgument,
    options: BigDecimalFloatFormatOptions
  ): string {
    const base = new BN(10).pow(this.exponent.abs());
    const div = this.mantissa.div(base);
    const mod = this.mantissa.mod(base);

    if (mod.eq(new BN(0))) {
      return toSafeNumber(div).toLocaleString(locale, options);
    }

    return Number.parseFloat(
      div.toString() + "." + mod.toString()
    ).toLocaleString(locale, options);
  }

  /* adjustDecimalPoint
   *     Adjusts one of the numbers so that both are in a representation with equal-valued exponents.
   * Effectively, it multiples the mantissa of the number with least-valued exponent (not necessarily the lesser number,
   * as the representation isn't unique) by 10 to the power of the difference in the exponents (notably by 1 when the
   * exponents are the same).
   */
  static adjustDecimalPoint(
    a: BigDecimalFloat,
    b: BigDecimalFloat
  ): [BigDecimalFloat, BigDecimalFloat] {
    let delta = a.exponent.sub(b.exponent);
    let normalizationFactor = new BN(10).pow(delta.abs());

    if (delta.gt(new BN(0))) {
      a.mantissa = a.mantissa.mul(normalizationFactor);
      a.exponent = b.exponent;
    } else {
      b.mantissa = b.mantissa.mul(normalizationFactor);
      b.exponent = a.exponent;
    }

    return [a, b];
  }

  /* divideWithPrecision
   *     Divides two BigDecimalFloats with a specified minimum decimal precision. As it first adjusts
   * their representations to have equal-valued exponents, before evaluating the division it is a notable
   * implementation detail that the result will have a representation with exponent equal to the specified
   * minimum precision.
   */
  divideWithPrecision(
    denominator: BigDecimalFloat,
    decimalPrecision: BN
  ): BigDecimalFloat {
    const [a, b] = BigDecimalFloat.adjustDecimalPoint(this, denominator);

    return new BigDecimalFloat(
      a.mantissa.mul(new BN(10).pow(decimalPrecision)).div(b.mantissa),
      decimalPrecision.neg()
    );
  }

  /* formatQuotient
   *     An utilitary method meant to be a concise way to format the result of a division. It also encapsulates
   * the unit logic described in the FormatQuotientOptions type.
   */
  formatQuotient(
    denominator: BigDecimalFloat,
    precision: BN,
    {
      unit = "",
      formatOptions = { maximumFractionDigits: 2 },
    }: FormatQuotientOptions
  ): string {
    const quotient = this.divideWithPrecision(denominator, precision);

    return (
      quotient.toLocaleString([...navigator.languages], formatOptions) +
      (unit ? ` ${unit}` : "")
    );
  }

  clone(): BigDecimalFloat {
    return new BigDecimalFloat(this.mantissa.clone(), this.exponent.clone());
  }

  debug() {
    return {
      mantissa: this.mantissa.toString(),
      exponent: this.exponent.toString(),
    };
  }
}
