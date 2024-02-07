import core from '@actions/core'
import { Octokit } from 'octokit'
;async () => {
  const name = core.getInput('name')
  const action = core.getInput('action')

  const [owner, repo] = process.env.GITHUB_REPOSITORY?.split('/') ?? []

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  })

  const [{ data: base }, { data: allRepo }] = await Promise.all([
    octokit.rest.issues.getLabel({
      owner,
      repo,
      name
    }),
    octokit.rest.repos.listForUser({
      username: owner
    })
  ])

  const result = allRepo
    .filter((x) => x.name !== repo)
    .map(async (repo) => {
      if (action === 'created' || action === 'edited') {
        try {
          await octokit.rest.issues.getLabel({
            owner: repo.owner.login,
            repo: repo.name,
            name
          })

          await octokit.rest.issues.createLabel({
            owner: repo.owner.login,
            repo: repo.name,
            name,
            color: base.color,
            description: base.description ?? ''
          })
        } catch {
          octokit.rest.issues.createLabel({
            owner: repo.owner.login,
            repo: repo.name,
            name,
            color: base.color,
            description: base.description ?? ''
          })
        }
      }

      if (action === 'deleted') {
        await octokit.rest.issues.deleteLabel({
          owner: repo.owner.login,
          repo: repo.name,
          name
        })
      }
    })

  await Promise.allSettled(result)
}
