export type PayloadData =
  | {
      label: {
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
      repo: string
      owner: string
      type: 'created' | 'deleted' | 'edited'
    }
  | {
      repo: string
      owner: string
      type: 'repo_created'
    }
