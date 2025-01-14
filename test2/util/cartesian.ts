/*
  Copyright 2016–2025 Jan Dockx

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
 */

export function x<T extends unknown[]>(...args: { [K in keyof T]: T[K][] }): { [K in keyof T]: T[K] }[] {
  if (args.length <= 0) {
    return []
  }

  return args.reduce<{ [K in keyof T]: T[K] }[]>(
    (acc, arrayI) => {
      const ret: { [K in keyof T]: T[K] }[] = []
      acc.forEach(elementSoFar => {
        arrayI.forEach(elementOfI => {
          ret.push([...elementSoFar, elementOfI] as { [K in keyof T]: T[K] })
        })
      })
      return ret
    },
    [[] as { [K in keyof T]: T[K] }]
  )
}
