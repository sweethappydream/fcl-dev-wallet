import Namegenerator from "namegenerator"
import {NewAccount} from "src/accounts"

const ALPHABET = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "FOO"
]

export function accountLabelGenerator(index: number) {
  const namegenerator = new Namegenerator(ALPHABET)
  return `Account ${namegenerator.nameForId(index)}`
}

export default function accountGenerator(index: number): NewAccount {
  return {type: "ACCOUNT", label: accountLabelGenerator(index), scopes: []}
}
