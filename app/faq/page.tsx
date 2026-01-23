export default function FAQ() {
  const faqs = [
    {
      question: "What are your opening hours?",
      answer: "We're open Tuesday to Sunday from 10:00 AM to 6:30 PM. We're closed on Mondays except during Public & School Holidays."
    },
    {
      question: "How do I book a session?",
      answer: "You can book a session by calling our official line at 09067731584 or by using our online booking system."
    },
    {
      question: "What packages do you offer?",
      answer: "We offer various packages including Exclusive Use of facility booking, Three House Party Booking, Small group birthday handouts, and more. Please contact us for detailed pricing."
    },
    {
      question: "Do you host private events?",
      answer: "Yes! We host bridal showers, school fun-day outings, movie shootings, dance classes, private events, football viewing, and fun hangouts."
    },
  ]

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-12 text-secondary">Frequently Asked Questions</h1>
      <div className="max-w-3xl mx-auto space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2 text-primary">{faq.question}</h3>
            <p className="text-gray-700">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
