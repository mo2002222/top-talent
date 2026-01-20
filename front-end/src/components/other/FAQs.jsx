import { useState } from "react";

const faqsData = [
  {
    question: "What is this platform about?",
    answer:
      "This platform is dedicated to discovering and showcasing football talents through user-submitted videos and images.",
  },
  {
    question: "Can I upload full match videos?",
    answer:
      "No. Uploading full matches or copyrighted broadcasts is not allowed. Only short clips, highlights, or talent showcases are permitted.",
  },
  {
    question: "Who can upload content?",
    answer:
      "Any registered user can upload football-related images and videos, subject to moderation.",
  },
  {
    question: "How is content moderated?",
    answer:
      "Content is reviewed using automated tools and human moderation. Content that violates guidelines may be removed.",
  },
  {
    question: "What happens if my content is reported?",
    answer:
      "Reported content is reviewed by our moderation team. If it violates policies, it may be removed.",
  },
  {
    question: "How can I report inappropriate content?",
    answer: "You can use the 'Report Content' option available on each post.",
  },
  {
    question: "How do I contact support?",
    answer:
      "You can reach us through the Contact Us page for any questions or concerns.",
  },
];

const FAQs = ({ isOpen, onClose }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!isOpen) return null;
  return (
    <div className="w-full max-w-3xl mx-3 bg-slate-800 p-6 rounded-md relative">
      <h1 className="text-3xl font-bold mb-6 text-white">
        Frequently Asked Questions
      </h1>
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
      >
        ✕
      </button>

      <div className="space-y-3">
        {faqsData.map((faq, index) => (
          <div key={index} className="border border-gray-700 rounded-md">
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex justify-between items-center px-4 py-3 text-left text-white hover:bg-slate-700"
            >
              <span className="font-medium">{faq.question}</span>
              <span className="text-xl">{openIndex === index ? "−" : "+"}</span>
            </button>

            {openIndex === index && (
              <div className="px-4 py-3 text-gray-300 bg-slate-700">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQs;
