async function setAdmin() {
  try {
    const response = await fetch('http://localhost:3000/api/admin/set-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'qtran1277@gmail.com'
      })
    })

    const data = await response.json()
    console.log('Response:', data)
  } catch (error) {
    console.error('Error:', error)
  }
}

setAdmin() 