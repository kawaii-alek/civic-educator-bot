'use client';

import { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Award, 
  BookOpen, 
  Menu,
  ChevronRight,
  Trophy
} from 'lucide-react';

interface QuizProps {
  language: string;
  setIsSidebarOpen: (open: boolean) => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export default function Quiz({ language, setIsSidebarOpen }: QuizProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [highScores, setHighScores] = useState<Record<string, number>>({});

  useEffect(() => {
    const saved = localStorage.getItem('civic_quiz_high_scores');
    if (saved) {
      try {
        setHighScores(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveHighScore = (category: string, finalScore: number) => {
    const currentHigh = highScores[category] || 0;
    if (finalScore > currentHigh) {
      const updated = { ...highScores, [category]: finalScore };
      setHighScores(updated);
      localStorage.setItem('civic_quiz_high_scores', JSON.stringify(updated));
    }
  };

  const categories: Record<string, { title: string; desc: string; icon: any; questions: Question[] }> = {
    rights: {
      title: language === 'sw' ? "Mswada wa Haki" : "Bill of Rights",
      desc: language === 'sw' ? "Pima ufahamu wako kuhusu haki zako na uhuru wa kimsingi." : "Test your knowledge on your fundamental rights and freedoms.",
      icon: BookOpen,
      questions: [
        {
          id: 1,
          question: language === 'sw' 
            ? "Ni haki gani ya kimsingi ambayo haiwezi kupunguzwa au kuondolewa chini ya hali yoyote?"
            : "Which fundamental right cannot be limited or restricted under any circumstances?",
          options: language === 'sw' 
            ? ["Uhuru wa kujieleza", "Uhuru dhidi ya kuteswa au kutendewa kinyama", "Haki ya kupiga kura", "Haki ya kumiliki mali"]
            : ["Freedom of expression", "Freedom from torture and cruel, inhuman treatment", "Right to vote", "Right to own property"],
          answerIndex: 1,
          explanation: language === 'sw'
            ? "Kifungu cha 25 kinataja haki ambazo haziwezi kuzuiliwa, ikiwemo uhuru dhidi ya kuteswa au kutendewa kikatili, uhuru dhidi ya utumwa, na haki ya kesi ya haki."
            : "Article 25 lists rights that may not be limited under any circumstance, including freedom from torture, freedom from slavery, and the right to a fair trial."
        },
        {
          id: 2,
          question: language === 'sw'
            ? "Kulingana na Kifungu cha 53, kila mtoto ana haki ya kupata elimu ya aina gani ya lazima?"
            : "According to Article 53, every child has the right to what level of compulsory education?",
          options: language === 'sw'
            ? ["Elimu ya chekechea tu", "Elimu ya msingi ya bure na ya lazima", "Elimu ya sekondari ya bure", "Elimu ya chuo kikuu"]
            : ["Kindergarten only", "Free and compulsory basic education", "Free secondary education", "University education"],
          answerIndex: 1,
          explanation: language === 'sw'
            ? "Kifungu cha 53(1)(b) kinaeleza kwamba kila mtoto ana haki ya kupata elimu ya msingi ya bure na ya lazima."
            : "Article 53(1)(b) states that every child has the right to free and compulsory basic education."
        },
        {
          id: 3,
          question: language === 'sw'
            ? "Mtu aliyekamatwa anapaswa kufikishwa kortini ndani ya muda gani baada ya kukamatwa?"
            : "Within how many hours must an arrested person be brought to court?",
          options: language === 'sw'
            ? ["Saa 12", "Saa 24", "Saa 48", "Saa 72"]
            : ["12 hours", "24 hours", "48 hours", "72 hours"],
          answerIndex: 1,
          explanation: language === 'sw'
            ? "Kifungu cha 49(1)(f) kinasema mtu aliyekamatwa lazima afikishwe kortini haraka iwezekanavyo, na isizidi saa 24 baada ya kukamatwa."
            : "Article 49(1)(f) mandates that an arrested person must be brought before a court as soon as reasonably possible, but not later than 24 hours after being arrested."
        },
        {
          id: 4,
          question: language === 'sw'
            ? "Chini ya Kifungu cha 31, haki ya faragha inalinda dhidi ya nini?"
            : "Under Article 31, what does the right to privacy protect against?",
          options: language === 'sw'
            ? ["Vizuizi vya kusema", "Upekuzi usio halali na kutaifishwa kwa mali", "Ufikiaji wa ada za korti", "Haki ya kugoma"]
            : ["Speech limitations", "Unlawful searches and seizures of property", "Access to court fees", "Right to strike"],
          answerIndex: 1,
          explanation: language === 'sw'
            ? "Kifungu cha 31 kinahakikisha faragha ya mtu, nyumba, mali, na mawasiliano dhidi ya upekuzi usio halali au kutaifishwa."
            : "Article 31 guarantees privacy of person, home, property, and communications, protecting them from unlawful searches and seizures."
        },
        {
          id: 5,
          question: language === 'sw'
            ? "Kifungu cha 37 kinahakikisha mkusanyiko na maandamano chini ya hali gani?"
            : "Article 37 guarantees assembly and protest under what condition?",
          options: language === 'sw'
            ? ["Kwa kibali cha serikali tu", "Kwa amani na bila silaha", "Mchana tu", "Ndani ya majengo ya umma tu"]
            : ["With government permission only", "Peaceably and unarmed", "Only during the daytime", "Only inside public buildings"],
          answerIndex: 1,
          explanation: language === 'sw'
            ? "Kifungu cha 37 kinatoa haki kwa kila mtu kukusanyika, kuandamana, na kuwasilisha malalamiko kwa amani na bila silaha."
            : "Article 37 gives every person the right to assemble, demonstrate, picket, and present petitions, provided they do so peaceably and unarmed."
        },
        {
          id: 6,
          question: language === 'sw'
            ? "Chini ya Kifungu cha 26, uzima wa mwanadamu unaanza lini?"
            : "Under Article 26, when does a person's life begin?",
          options: language === 'sw'
            ? ["Wakati wa kuzaliwa", "Wakati wa kutungwa mimba", "Miezi sita ya ujauzito", "Inaposajiliwa na serikali"]
            : ["At birth", "At conception", "At six months of pregnancy", "When registered by the state"],
          answerIndex: 1,
          explanation: language === 'sw'
            ? "Kifungu cha 26(2) kinasema wazi kabisa kuwa uzima wa mtu unaanza wakati wa kutungwa mimba."
            : "Article 26(2) explicitly states that the life of a person begins at conception."
        },
        {
          id: 7,
          question: language === 'sw'
            ? "Uhuru wa vyombo vya habari chini ya Kifungu cha 34 haujumuishi yafuatayo?"
            : "Media freedom under Article 34 does not extend to which of the following?",
          options: language === 'sw'
            ? ["Kukosoa sera za serikali", "Ripoti za uchunguzi", "Hotuba za chuki na uchochezi wa vurugu", "Matangazo ya bunge"]
            : ["Criticism of government policies", "Investigative reporting", "Hate speech and incitement to violence", "Live broadcast of parliamentary debates"],
          answerIndex: 2,
          explanation: language === 'sw'
            ? "Kifungu cha 33(2) na 34(1) vinaeleza kuwa uhuru wa kujieleza na vyombo vya habari haujumuishi propaganda za vita, uchochezi wa vurugu, au hotuba za chuki."
            : "Articles 33(2) and 34(1) state that freedom of expression and media do not extend to war propaganda, incitement to violence, hate speech, or advocacy of hatred."
        },
        {
          id: 8,
          question: language === 'sw'
            ? "Ni nani aliye na haki ya kupata habari zinazoshikiliwa na Dola chini ya Kifungu cha 35?"
            : "Who has the right of access to information held by the State under Article 35?",
          options: language === 'sw'
            ? ["Maafisa wa dola tu", "Kila raia", "Waandishi wa habari tu", "Wabunge tu"]
            : ["Only state officers", "Every citizen", "Only accredited journalists", "Only members of parliament"],
          answerIndex: 1,
          explanation: language === 'sw'
            ? "Kifungu cha 35(1)(a) kinampa kila raia haki ya kupata habari zinazoshikiliwa na Dola."
            : "Article 35(1)(a) grants every citizen the right of access to information held by the State."
        }
      ]
    },
    government: {
      title: language === 'sw' ? "Muundo wa Serikali" : "Government Structure",
      desc: language === 'sw' ? "Jaribu maswali kuhusu Bunge, Rais, Mahakama na Kaunti." : "Test your knowledge on the Executive, Legislature, Judiciary, and Devolution.",
      icon: GraduationCap,
      questions: [
        {
          id: 1,
          question: language === 'sw'
            ? "Mamlaka yote ya kihalisi nchini Kenya ni ya nani kulingana na Kifungu cha 1?"
            : "To whom does all sovereign power in Kenya belong according to Article 1?",
          options: language === 'sw'
            ? ["Rais", "Bunge", "Wananchi wa Kenya", "Mahakama Kuu"]
            : ["The President", "Parliament", "The People of Kenya", "The High Court"],
          answerIndex: 2,
          explanation: language === 'sw'
            ? "Kifungu cha 1(1) kinasema wazi kuwa mamlaka yote ya kifaifalme ni ya wananchi wa Kenya na yataendeshwa tu kulingana na Katiba."
            : "Article 1(1) clearly dictates that all sovereign power belongs to the people of Kenya, to be exercised only in accordance with the Constitution."
        },
        {
          id: 2,
          question: language === 'sw'
            ? "Kuna serikali za kaunti ngapi zilizoundwa chini ya mfumo wa ugatuzi?"
            : "How many county governments are established under the devolved system?",
          options: language === 'sw'
            ? ["Kaunti 8", "Kaunti 47", "Kaunti 50", "Kaunti 290"]
            : ["8 Counties", "47 Counties", "50 Counties", "290 Counties"],
          answerIndex: 1,
          explanation: language === 'sw'
            ? "Ratiba ya Kwanza ya Katiba inataja kaunti 47, kila moja ikiwa na serikali yake ya kaunti."
            : "The First Schedule of the Constitution of Kenya lists the 47 counties that constitute the devolved level of government."
        },
        {
          id: 3,
          question: language === 'sw'
            ? "Nani anayeshikilia wadhifa wa mkuu wa serikali na mkuu wa nchi nchini Kenya?"
            : "Who holds the position of head of state and head of government in Kenya?",
          options: language === 'sw'
            ? ["Spika wa Bunge", "Rais", "Waziri Mkuu", "Jaji Mkuu"]
            : ["The Speaker of Parliament", "The President", "The Prime Minister", "The Chief Justice"],
          answerIndex: 1,
          explanation: language === 'sw'
            ? "Chini ya Kifungu cha 131, Rais ndiye Mkuu wa Nchi na Mkuu wa Serikali wa Jamhuri ya Kenya."
            : "Under Article 131, the President is both the Head of State and the Head of Government of the Republic of Kenya."
        },
        {
          id: 4,
          question: language === 'sw'
            ? "Muda wa ofisi ya Rais wa Kenya kabla ya uchaguzi mkuu unaofuata ni muda gani?"
            : "What is the term of office for the President of Kenya before the next general election?",
          options: language === 'sw'
            ? ["Miaka 4", "Miaka 5", "Miaka 6", "Hakuna ukomo"]
            : ["4 years", "5 years", "6 years", "No limit"],
          answerIndex: 1,
          explanation: language === 'sw'
            ? "Chini ya Kifungu cha 136, uchaguzi wa rais unafanywa kila baada ya miaka 5, siku ya Jumanne ya pili ya mwezi wa Agosti."
            : "Under Article 136, the presidential election is held on the second Tuesday in August in every fifth year, establishing a 5-year term."
        },
        {
          id: 5,
          question: language === 'sw'
            ? "Ni chombo gani chenye jukumu na mamlaka ya mwisho ya kutafsiri Katiba ya Kenya?"
            : "Which organ has the final authority to interpret the Constitution of Kenya?",
          options: language === 'sw'
            ? ["Bunge", "Serikali Kuu", "Mahakama", "Jeshi la Polisi"]
            : ["The Legislature", "The Executive", "The Judiciary", "The Police Service"],
          answerIndex: 2,
          explanation: language === 'sw'
            ? "Mahakama (mahakama za kisheria) ndicho chombo huru chenye mamlaka ya kutafsiri na kulinda Katiba."
            : "The Judiciary is the independent organ with the primary authority to interpret and uphold the Constitution."
        },
        {
          id: 6,
          question: language === 'sw'
            ? "Jaku la Seneti ya Kenya ni nani kulingana na Kifungu cha 96?"
            : "What is the primary role of the Senate of Kenya according to Article 96?",
          options: language === 'sw'
            ? ["Kusimamia jeshi la ulinzi", "Kuwakilisha na kulinda serikali za kaunti", "Kuteua Mawaziri", "Kusimamia idara za usalama"]
            : ["To command the military", "To represent and protect devolved county governments", "To appoint Cabinet Secretaries", "To run national security services"],
          answerIndex: 1,
          explanation: language === 'sw'
            ? "Seneti inawakilisha kaunti na inafanya kazi ya kulinda maslahi ya serikali za kaunti zilizogatuliwa."
            : "Under Article 96, the Senate represents the counties, serves to protect their interests, and participates in law-making concerning counties."
        },
        {
          id: 7,
          question: language === 'sw'
            ? "Nani anayeshikilia wadhifa wa mwenyekiti wa Baraza la Usalama la Kitaifa (NSC)?"
            : "Who acts as the chairperson of the National Security Council (NSC)?",
          options: language === 'sw'
            ? ["Mkuu wa Majeshi ya Ulinzi", "Waziri wa Mambo ya Ndani", "Rais", "Inspekta Jenerali wa Polisi"]
            : ["Chief of Defence Forces", "Cabinet Secretary for Interior", "The President", "Inspector-General of Police"],
          answerIndex: 2,
          explanation: language === 'sw'
            ? "Kifungu cha 240(2)(a) kinaeleza kuwa Rais ndiye mwenyekiti wa Baraza la Usalama la Kitaifa."
            : "Article 240(2)(a) designates the President as the chairperson of the National Security Council."
        },
        {
          id: 8,
          question: language === 'sw'
            ? "Kuna wabunge wangapi wa Bunge la Kitaifa wanaowakilisha maeneo bunge ya kawaida?"
            : "How many members of the National Assembly represent single-member constituencies?",
          options: language === 'sw'
            ? ["Wabunge 47", "Wabunge 290", "Wabunge 349", "Wabunge 416"]
            : ["47 members", "290 members", "349 members", "416 members"],
          answerIndex: 1,
          explanation: language === 'sw'
            ? "Kifungu cha 97(1)(a) kinaeleza kuwa kuna wabunge 290, kila mmoja akichaguliwa na wapiga kura wa maeneo bunge ya kawaida."
            : "Article 97(1)(a) specifies 290 members, each elected by the registered voters of single-member constituencies."
        }
      ]
    }
  };

  const activeQuiz = activeCategory ? categories[activeCategory] : null;
  const questions = activeQuiz ? activeQuiz.questions : [];
  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionSelect = (index: number) => {
    if (isSubmitted) return;
    setSelectedOptionIndex(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOptionIndex === null || isSubmitted) return;

    if (selectedOptionIndex === currentQuestion.answerIndex) {
      setScore(prev => prev + 1);
    }
    setIsSubmitted(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionIndex(null);
      setIsSubmitted(false);
    } else {
      setShowResults(true);
      if (activeCategory) {
        saveHighScore(activeCategory, score + (selectedOptionIndex === currentQuestion.answerIndex ? 1 : 0));
      }
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setIsSubmitted(false);
    setShowResults(false);
    setScore(0);
  };

  const getBadgeName = (scorePercentage: number) => {
    if (scorePercentage === 100) return language === 'sw' ? "Mwanasheria Mkuu" : "Supreme Jurist";
    if (scorePercentage >= 60) return language === 'sw' ? "Mwananchi Amilifu" : "Active Citizen";
    return language === 'sw' ? "Kiranja Mwanafunzi" : "Constitutional Novice";
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Header */}
      <header className="px-6 md:px-10 py-6 bg-white border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-slate-900 leading-tight">
              {language === 'sw' ? "Elimu na Maswali ya Katiba" : "Civic Quiz & Education"}
            </h1>
            <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">
              {language === 'sw' ? "Boresha uelewa wako wa kikatiba kwa maswali rasmi" : "Structured learning portal on Kenyan constitutional law"}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col justify-center items-center">
        
        {/* Category Select Screen */}
        {!activeCategory && (
          <div className="w-full max-w-2xl space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-serif font-bold text-slate-900">
                {language === 'sw' ? "Chagua Mada ya Maswali" : "Choose a Quiz Topic"}
              </h2>
              <p className="text-slate-500 text-sm">
                {language === 'sw' ? "Kila kitengo kina maswali 3 ya kuchagua jibu sahihi." : "Each quiz contains multiple choice questions designed to verify constitutional facts."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(categories).map(([key, cat]) => {
                const Icon = cat.icon;
                const high = highScores[key] || 0;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveCategory(key);
                      resetQuiz();
                    }}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-slate-400 hover:scale-[1.01] transition-all text-left flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-10 h-10 rounded bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
                        <Icon size={20} />
                      </div>
                      <h3 className="font-serif font-bold text-base text-slate-900 mb-2">{cat.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{cat.desc}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center w-full">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
                        <Trophy size={14} className="opacity-70" />
                        <span>{language === 'sw' ? `Alama za Juu: ${high}/3` : `High Score: ${high}/3`}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 flex items-center gap-0.5">
                        {language === 'sw' ? "Anza" : "Start"}
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Question Screen */}
        {activeCategory && !showResults && currentQuestion && (
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm space-y-6">
            
            {/* Progress Bar & Header */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
                <span>{activeQuiz?.title}</span>
                <span>{currentQuestionIndex + 1} / {questions.length}</span>
              </div>
              <div className="w-full h-1 bg-slate-100 rounded overflow-hidden">
                <div 
                  className="h-full bg-slate-700 transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Text */}
            <h3 className="font-serif font-bold text-lg text-slate-900 leading-snug">
              {currentQuestion.question}
            </h3>

            {/* Option Buttons */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOptionIndex === idx;
                const isCorrectAnswer = currentQuestion.answerIndex === idx;
                
                let btnStyle = "border-slate-200 hover:border-slate-350 hover:bg-slate-50";
                let checkIcon = null;

                if (isSelected) {
                  btnStyle = "border-slate-700 bg-slate-50 text-slate-950";
                }

                if (isSubmitted) {
                  if (isCorrectAnswer) {
                    btnStyle = "border-emerald-600 bg-emerald-50 text-emerald-950";
                    checkIcon = <CheckCircle2 size={16} className="text-emerald-700" />;
                  } else if (isSelected) {
                    btnStyle = "border-red-600 bg-red-50 text-red-950";
                    checkIcon = <XCircle size={16} className="text-red-700" />;
                  } else {
                    btnStyle = "border-slate-100 opacity-60";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isSubmitted}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full flex items-center justify-between p-4 rounded border text-left text-sm font-semibold transition-all duration-150 ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {checkIcon}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Controls */}
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-4">
              {isSubmitted && (
                <div className="p-4 rounded bg-slate-50 border border-slate-200 text-xs md:text-sm text-slate-700 leading-relaxed font-sans">
                  <span className="block font-bold text-slate-900 mb-1">
                    {selectedOptionIndex === currentQuestion.answerIndex 
                      ? (language === 'sw' ? 'Sahihi' : 'Correct')
                      : (language === 'sw' ? 'Kosa' : 'Incorrect')}
                  </span>
                  {currentQuestion.explanation}
                </div>
              )}

              <div className="flex justify-between items-center gap-3">
                <button
                  onClick={() => setActiveCategory(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-500 rounded active:scale-95 transition-all"
                >
                  {language === 'sw' ? "Ghairi" : "Cancel"}
                </button>

                {!isSubmitted ? (
                  <button
                    disabled={selectedOptionIndex === null}
                    onClick={handleSubmitAnswer}
                    className="px-5 py-2.5 rounded bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-sm shadow-sm transition-all"
                  >
                    {language === 'sw' ? "Wasilisha Jibu" : "Submit Answer"}
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-5 py-2.5 rounded bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm shadow-sm transition-all"
                  >
                    {currentQuestionIndex < questions.length - 1 
                      ? (language === 'sw' ? 'Swali Lifuatalo' : 'Next Question') 
                      : (language === 'sw' ? 'Maliza' : 'Finish')}
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Results Screen */}
        {showResults && (
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-700">
              <Trophy size={32} />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-serif font-bold text-slate-900">
                {language === 'sw' ? "Matokeo Yako" : "Quiz Completed"}
              </h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {getBadgeName((score / questions.length) * 100)}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded border border-slate-200 flex justify-around items-center">
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Score</span>
                <span className="text-2xl font-serif font-bold text-slate-800">{score} / {questions.length}</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Accuracy</span>
                <span className="text-2xl font-serif font-bold text-slate-800">
                  {Math.round((score / questions.length) * 100)}%
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={resetQuiz}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded border border-slate-200 hover:bg-slate-50 text-slate-750 font-bold text-xs transition-all"
              >
                <RotateCcw size={14} />
                <span>{language === 'sw' ? "Rudia" : "Retry"}</span>
              </button>
              <button
                onClick={() => setActiveCategory(null)}
                className="flex-1 py-2.5 rounded bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition-all"
              >
                {language === 'sw' ? "Mada Nyingine" : "Other Topics"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
