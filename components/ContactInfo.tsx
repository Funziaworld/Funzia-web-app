export default function ContactInfo() {
  const openingTimes = [
    { day: 'Monday', hours: 'Closed (Except during Public & School Holidays)' },
    { day: 'Tuesday', hours: '10:00–18:00' },
    { day: 'Wednesday', hours: '10:00–18:00' },
    { day: 'Thursday', hours: '10:00–18:00' },
    { day: 'Friday', hours: '10:00–18:30' },
    { day: 'Saturday', hours: '10:00–18:30' },
    { day: 'Sunday', hours: '10:00–18:30' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold mb-6 text-primary">Contact Information</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Phone</p>
            <a href="tel:09067731584" className="text-lg text-gray-800 hover:text-primary">
              0906 773 1584
            </a>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Email</p>
            <a href="mailto:hello@funziaworld.com" className="text-lg text-gray-800 hover:text-primary">
              hello@funziaworld.com
            </a>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Address</p>
            <p className="text-lg text-gray-800">
              12 Africa Lane, Off Admiralty Road, Lekki Phase 1
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold mb-6 text-primary">Opening Times</h2>
        <div className="space-y-2">
          {openingTimes.map((time, index) => (
            <div key={index} className="flex justify-between border-b border-gray-200 pb-2">
              <span className="font-medium text-gray-700">{time.day}</span>
              <span className="text-gray-600">{time.hours}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
