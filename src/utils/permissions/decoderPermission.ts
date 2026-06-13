export const decodePermissions = (roles: any[]): Set<string> => {
  const permissions = new Set<string>()

  roles?.forEach(role => {
    role?.permissions?.forEach((perm: any) => {
      try {
        //viene como string (base64)
        if (typeof perm === 'string') {
          const decoded = atob(atob(perm)) // doble decode
          permissions.add(decoded)
        }

        //viene como objeto
        else if (perm?.name) {
          permissions.add(perm.name.toLowerCase().replace(/\s+/g, '_'))
        }

      } catch (error) {
        console.error('Error decoding permission:', perm)
      }
    })
  })

  return permissions
}