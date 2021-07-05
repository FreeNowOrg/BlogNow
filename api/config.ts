import { VercelRequest, VercelResponse } from '@vercel/node'
import { createFilter, createProjection, dbFind, dbUpdateOne } from './database'
import { readFileSync } from 'fs'

export interface SiteConfig {
  version: string
  secret: string
  siteName: string
  configPrefix: string
  database: string
  tablePrefix: string
}

// HTTP Response
export default async (req: VercelRequest, res: VercelResponse) => {}

function _tryFile(path: string) {
  try {
    return JSON.parse(readFileSync(path).toString())
  } catch (err) {
    console.warn(err)
    return null
  }
}

/**
 * @param {string[]} key
 * @returns {any[]}
 *
 * @desc 通过键名数组返回本地设置，优先级: 环境变量(env) > blognow.config.json > 预设(default)
 *       环境变量键名是由 前缀+键名 然后大写得到的，例如“secret”预设将获取“BLOGNOW_SECRET”环境变量的值
 */
export async function _getLocalConfigs(key: string[]): Promise<any[]> {
  let result: any[] = []

  const conf = {
    // defaults
    configPrefix: 'BLOGNOW_',
    database: 'blog-now',
    tablePrefix: '',
    // file
    // ..._tryFile('blognow.config.sample.json'),
    ..._tryFile('blognow.config.json'),
  } as SiteConfig

  key.forEach((i) => {
    const envName = `${conf.configPrefix}${i}`
      .trim()
      .replace(/\s/g, '_')
      .toUpperCase()
    // console.log({ envName, value: process.env[envName] })
    result.push(process.env[envName] || conf[i as keyof SiteConfig] || null)
  })

  return result
}

export async function _getDatabaseConfigs(key: string[]) {
  try {
    const data = await dbFind('config', { key: { $in: key } })
    return data.map((i) => i.value || null)
  } catch (err) {
    const final = []
    for (let i = 0; i < key.length; i++) final.push(null)
    return final
  }
}

export async function getBatchConfigs(key: string[]) {
  let [local, db] = await Promise.all([
    _getLocalConfigs(key),
    _getDatabaseConfigs(key),
  ])

  let final = []
  for (let i = 0; i < key.length; i++) final.push(local[i] || db[i] || null)

  console.log('getConfigs', { local, db, final })
  return final
}

export async function getConfigValue(key: string) {
  const [data] = await getBatchConfigs([key])
  return data
}

export async function setConfig(key: string, value: any) {
  await dbUpdateOne('config', { key }, { $set: { value } })
}
