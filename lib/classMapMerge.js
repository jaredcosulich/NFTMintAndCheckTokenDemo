const classMapMerge = (defaultClasses, newClasses, join=true) => {
  const merged = Object.values({
    ...defaultClasses,
    ...newClasses
  })

  return join ? merged.join(' ') : merged
}

export default classMapMerge;