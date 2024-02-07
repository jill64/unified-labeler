import { LabelEditedEvent } from 'octoflare/webhook'

type Label = {
  id: number
  node_id: string
  /**
   * URL for the label
   */
  url: string
  /**
   * The name of the label.
   */
  name: string
  description: string | null
  /**
   * 6-character hex code, without the leading #, identifying the color
   */
  color: string
  default: boolean
}

export type PayloadData = {
  label: Label
} & (
  | {
      type: 'created' | 'deleted'
    }
  | {
      changes: LabelEditedEvent['changes']
      type: 'edited'
    }
)
