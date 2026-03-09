const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const contactForm = document.getElementById('contactForm');

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        themeToggle.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    }
});

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        apartment: document.getElementById('apartment').value,
        message: document.getElementById('message').value,
        timestamp: new Date().toLocaleString('ko-KR')
    };
    
    let savedContacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    savedContacts.push(formData);
    localStorage.setItem('contacts', JSON.stringify(savedContacts));
    
    alert(`상담 신청이 완료되었습니다!\n\n이름: ${formData.name}\n연락처: ${formData.phone}\n관심 아파트: ${formData.apartment}\n\n담당자가 빠른 시일 내에 연락드리겠습니다.`);
    
    contactForm.reset();
});

const detailButtons = document.querySelectorAll('.detail-btn');
detailButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const apartmentName = btn.closest('.apartment-card').querySelector('.apartment-name').textContent;
        alert(`${apartmentName}의 상세 정보는 준비 중입니다.\n\n상담 신청을 통해 자세한 정보를 받아보실 수 있습니다.`);
    });
});

console.log('아파트 분양 사이트가 정상적으로 로드되었습니다.');

const chatbotToggle = document.getElementById('chatbotToggle');
const chatbotWindow = document.getElementById('chatbotWindow');
const chatbotClose = document.getElementById('chatbotClose');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotSend = document.getElementById('chatbotSend');
const chatbotMessages = document.getElementById('chatbotMessages');
const quickReplies = document.querySelectorAll('.quick-reply');
let conversationHistory = [];

chatbotToggle.addEventListener('click', () => {
    chatbotWindow.classList.add('active');
    chatbotToggle.classList.add('active');
});

chatbotClose.addEventListener('click', () => {
    chatbotWindow.classList.remove('active');
    chatbotToggle.classList.remove('active');
});

function addUserMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'user-message';
    messageDiv.textContent = message;
    
    const quickRepliesDiv = chatbotMessages.querySelector('.quick-replies');
    if (quickRepliesDiv) {
        chatbotMessages.insertBefore(messageDiv, quickRepliesDiv);
    } else {
        chatbotMessages.appendChild(messageDiv);
    }
    
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function addBotMessage(message, isLoading = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'bot-message';
    
    if (isLoading) {
        messageDiv.innerHTML = '<p class="loading-dots">답변을 생성 중입니다<span>.</span><span>.</span><span>.</span></p>';
        messageDiv.id = 'loading-message';
    } else {
        const lines = message.split('\n');
        lines.forEach(line => {
            if (line.trim()) {
                const p = document.createElement('p');
                p.textContent = line;
                messageDiv.appendChild(p);
            }
        });
    }
    
    const quickRepliesDiv = chatbotMessages.querySelector('.quick-replies');
    if (quickRepliesDiv) {
        chatbotMessages.insertBefore(messageDiv, quickRepliesDiv);
    } else {
        chatbotMessages.appendChild(messageDiv);
    }
    
    setTimeout(() => {
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }, 100);
    
    return messageDiv;
}

function removeLoadingMessage() {
    const loadingMsg = document.getElementById('loading-message');
    if (loadingMsg) {
        loadingMsg.remove();
    }
}

function getKoreanTimeString() {
    const now = new Date();
    const koreanTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const year = koreanTime.getFullYear();
    const month = koreanTime.getMonth() + 1;
    const date = koreanTime.getDate();
    const hours = koreanTime.getHours();
    const minutes = koreanTime.getMinutes();
    const dayOfWeek = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][koreanTime.getDay()];
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    return `${year}년 ${month}월 ${date}일 ${dayOfWeek} ${ampm} ${displayHours}시 ${minutes}분`;
}

async function getOpenAIResponse(userMessage) {
    const apiKey = CONFIG.OPENAI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
        console.warn('[챗봇] API 키가 비어있습니다.');
        return null;
    }

    conversationHistory.push({ role: 'user', content: userMessage });

    const timeInfo = `\n\n[현재 한국 시간: ${getKoreanTimeString()}]`;

    try {
        console.log('[챗봇] OpenAI API 호출 중...');
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: CONFIG.MODEL,
                messages: [
                    { role: 'system', content: CONFIG.SYSTEM_PROMPT + timeInfo },
                    ...conversationHistory
                ],
                max_tokens: CONFIG.MAX_TOKENS,
                temperature: CONFIG.TEMPERATURE
            })
        });

        const data = await response.json();
        console.log('[챗봇] API 응답 상태:', response.status);

        if (!response.ok) {
            console.error('[챗봇] API 오류 상세:', JSON.stringify(data));
            conversationHistory.pop();

            if (response.status === 401) {
                return '❌ API 키가 올바르지 않거나 만료되었습니다.\n\n해결 방법:\n1. OpenAI 사이트에서 API 키 확인\n2. config.js의 OPENAI_API_KEY 값 확인\n3. 키가 만료되었다면 새로 발급\n\n🔗 https://platform.openai.com/api-keys';
            } else if (response.status === 429) {
                return '⚠️ API 사용량 한도를 초과했거나 크레딧이 부족합니다.\n\n해결 방법:\n1. OpenAI 사이트에서 크레딧 잔액 확인\n2. 결제 수단 등록 여부 확인\n3. 잠시 후 다시 시도\n\n🔗 https://platform.openai.com/account/billing';
            } else if (response.status === 404) {
                return '❌ API 모델을 찾을 수 없습니다.\n\nconfig.js에서 MODEL 값을 확인해주세요.\n현재 설정: ' + CONFIG.MODEL;
            }
            return `❌ API 오류가 발생했습니다. (코드: ${response.status})\n\n상세: ${data.error?.message || '알 수 없는 오류'}`;
        }

        const botMessage = data.choices[0].message.content;
        conversationHistory.push({ role: 'assistant', content: botMessage });

        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }

        console.log('[챗봇] AI 응답 성공');
        return botMessage;

    } catch (error) {
        console.error('[챗봇] 네트워크 오류:', error);
        conversationHistory.pop();
        return `❌ 네트워크 오류가 발생했습니다.\n\n오류 내용: ${error.message}\n\n확인 사항:\n• 인터넷 연결 상태\n• 브라우저 CORS 설정\n• API 키 유효성`;
    }
}

function getFallbackResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    const apartmentInfo = {
        '힐스테이트 달성공원역': '대구광역시 위치',
        '범어 자이르네': '대구광역시 범어동 위치',
        '범어 자이르네 주거용 오피스텔': '대구광역시 범어동 위치',
        '힐스테이트 대명 센트럴': '대구광역시 대명동 위치'
    };
    
    if (lowerMessage.includes('안녕') || lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
        return '안녕하세요! 아파트 분양 상담 챗봇입니다. 😊\n\n어떤 도움이 필요하신가요?\n\n문의 가능한 주제:\n• 분양가 정보\n• 평형 및 면적\n• 위치 및 교통\n• 상담 신청 방법\n• 입주 시기\n• 주변 편의시설';
    }
    
    else if (lowerMessage.includes('분양가') || lowerMessage.includes('가격') || lowerMessage.includes('얼마') || lowerMessage.includes('비용')) {
        return '분양가는 아파트별로 상이합니다. 😊\n\n현재 분양 중인 아파트:\n• 힐스테이트 달성공원역\n• 범어 자이르네\n• 범어 자이르네 주거용 오피스텔\n• 힐스테이트 대명 센트럴\n\n정확한 분양가는 전화 상담을 통해 안내드립니다.\n📞 1588-0000';
    }
    
    else if (lowerMessage.includes('평형') || lowerMessage.includes('평수') || lowerMessage.includes('면적') || lowerMessage.includes('타입')) {
        return '다양한 평형을 준비하고 있습니다. 🏠\n\n• 소형 평수부터 대형 평수까지 구비\n• 평면도 및 상세 정보는 상담을 통해 제공\n\n평형별 자세한 정보는:\n📞 1588-0000\n📧 contact@apartment.co.kr\n\n또는 페이지 하단 상담 신청을 이용해주세요!';
    }
    
    else if (lowerMessage.includes('위치') || lowerMessage.includes('교통') || lowerMessage.includes('어디') || lowerMessage.includes('지하철') || lowerMessage.includes('버스')) {
        return '각 아파트의 위치는 다음과 같습니다:\n\n📍 힐스테이트 달성공원역\n   → 대구광역시 (지하철 달성공원역 인근)\n\n📍 범어 자이르네\n   → 대구광역시 범어동\n\n📍 범어 자이르네 주거용 오피스텔\n   → 대구광역시 범어동\n\n📍 힐스테이트 대명 센트럴\n   → 대구광역시 대명동\n\n모두 교통이 편리한 위치입니다! 🚇';
    }
    
    else if (lowerMessage.includes('상담') || lowerMessage.includes('문의') || lowerMessage.includes('연락') || lowerMessage.includes('신청')) {
        return '상담 신청을 원하시나요? 😊\n\n📝 상담 신청 방법:\n1. 페이지 하단 "방문 상담 신청" 폼 작성\n2. 전화 상담: 📞 1588-0000\n3. 이메일: 📧 contact@apartment.co.kr\n\n⏰ 운영시간:\n• 평일: 09:00 - 18:00\n• 주말: 10:00 - 17:00\n\n친절하게 상담해드리겠습니다!';
    }
    
    else if (lowerMessage.includes('입주') || lowerMessage.includes('완공') || lowerMessage.includes('언제')) {
        return '입주 시기 문의 주셔서 감사합니다! 🏗️\n\n각 아파트별 입주 예정 시기는 상담을 통해 안내드립니다.\n\n자세한 일정은:\n📞 1588-0000으로 문의해주세요.\n\n분양 일정, 계약 조건 등도 함께 안내드리겠습니다!';
    }
    
    else if (lowerMessage.includes('편의시설') || lowerMessage.includes('시설') || lowerMessage.includes('주변') || lowerMessage.includes('학교') || lowerMessage.includes('마트')) {
        return '주변 편의시설이 궁금하시군요! 🏪\n\n각 단지별로:\n• 대형마트, 백화점 인접\n• 학교 및 학원가 근처\n• 병원, 은행 등 편의시설 완비\n• 공원 및 녹지 공간\n\n구체적인 주변 환경은 단지별로 상이하니,\n상담을 통해 자세히 안내드리겠습니다.\n\n📞 1588-0000';
    }
    
    else if (lowerMessage.includes('주차') || lowerMessage.includes('차')) {
        return '주차 시설 문의 감사합니다! 🚗\n\n• 세대당 주차 대수: 상담 시 안내\n• 지하 주차장 완비\n• 방문자 주차 공간 확보\n\n정확한 주차 대수 및 배치는:\n📞 1588-0000으로 문의해주세요!';
    }
    
    else if (lowerMessage.includes('감사') || lowerMessage.includes('고마워') || lowerMessage.includes('고맙')) {
        return '도움이 되셨다니 기쁩니다! 😊\n\n추가로 궁금하신 점이 있으시면\n언제든 문의해주세요.\n\n좋은 하루 되세요! 🏡';
    }
    
    else if (lowerMessage.includes('힐스테이트') || lowerMessage.includes('자이')) {
        const foundApt = Object.keys(apartmentInfo).find(apt => 
            lowerMessage.includes(apt.toLowerCase())
        );
        
        if (foundApt) {
            return `${foundApt}에 관심 가져주셔서 감사합니다! 🏢\n\n위치: ${apartmentInfo[foundApt]}\n\n자세한 정보:\n• 분양가\n• 평형 정보\n• 입주 시기\n• 주변 환경\n\n위 내용은 전화 상담을 통해 상세히 안내드립니다.\n📞 1588-0000`;
        }
    }
    
    else if (lowerMessage.includes('계약') || lowerMessage.includes('계약금') || lowerMessage.includes('중도금')) {
        return '계약 관련 문의 감사합니다! 📋\n\n• 계약금\n• 중도금\n• 잔금\n• 납부 일정\n\n계약 조건 및 납부 일정은 상담을 통해\n자세히 안내드립니다.\n\n📞 1588-0000\n📧 contact@apartment.co.kr';
    }
    
    else if (lowerMessage.includes('대출') || lowerMessage.includes('담보대출')) {
        return '대출 관련 문의 감사합니다! 💰\n\n• 중도금 대출\n• 주택담보대출\n• 대출 한도\n• 금리 정보\n\n금융 상담은 전문 상담사를 통해\n안내드리겠습니다.\n\n📞 1588-0000';
    }
    
    else if (lowerMessage.includes('모델하우스') || lowerMessage.includes('견본주택')) {
        return '모델하우스 방문을 원하시나요? 🏘️\n\n모델하우스에서는:\n• 실제 평형 확인\n• 마감재 체험\n• 상담사 1:1 상담\n• 단지 모형 관람\n\n방문 예약 및 위치 안내:\n📞 1588-0000\n\n예약 후 방문하시면 더욱 편리합니다!';
    }
    
    else {
        const generalKnowledge = getGeneralKnowledgeResponse(lowerMessage);
        if (generalKnowledge) {
            return generalKnowledge;
        }
        
        return `"${userMessage}" 에 대한 질문이시군요! 🤔\n\n현재 기본 응답 모드로 작동 중이라 제한적인 답변만 가능합니다.\n\n💡 아파트 분양 관련 질문:\n• 분양가가 궁금해요\n• 평형 정보를 알고 싶어요\n• 위치와 교통편은 어떤가요?\n• 입주는 언제인가요?\n• 주변 편의시설이 궁금해요\n\n더 자세한 답변이 필요하시면:\n📞 1588-0000\n📧 contact@apartment.co.kr\n\n전문 상담사가 친절히 안내드리겠습니다! 😊`;
    }
}

async function getRealTimeInfo(lowerMessage) {
    if (lowerMessage.includes('날씨')) {
        try {
            const response = await fetch('https://wttr.in/Seoul?format=j1');
            const data = await response.json();
            const current = data.current_condition[0];
            const temp = current.temp_C;
            const feelsLike = current.FeelsLikeC;
            const weather = current.lang_ko?.[0]?.value || current.weatherDesc[0].value;
            const humidity = current.humidity;
            
            return `서울 현재 날씨 정보입니다! 🌤️\n\n🌡️ 기온: ${temp}°C (체감 ${feelsLike}°C)\n☁️ 날씨: ${weather}\n💧 습도: ${humidity}%\n\n아파트 견학하기 좋은 날씨네요!\n📞 상담 문의: 1588-0000`;
        } catch (error) {
            return '날씨 정보를 가져오는 중 오류가 발생했습니다. 🌤️\n\n기상청 앱이나 날씨 사이트를 확인해주세요!\n\n아파트 상담은 언제든 가능합니다.\n📞 1588-0000';
        }
    }
    
    if (lowerMessage.includes('비트코인') || lowerMessage.includes('btc') || lowerMessage.includes('코인')) {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=krw&include_24hr_change=true');
            const data = await response.json();
            const btcPrice = data.bitcoin.krw.toLocaleString();
            const btcChange = data.bitcoin.krw_24h_change.toFixed(2);
            const ethPrice = data.ethereum.krw.toLocaleString();
            const ethChange = data.ethereum.krw_24h_change.toFixed(2);
            const btcIcon = btcChange >= 0 ? '📈' : '📉';
            const ethIcon = ethChange >= 0 ? '📈' : '📉';
            
            return `암호화폐 현재 시세입니다! 💰\n\n₿ 비트코인(BTC)\n가격: ${btcPrice}원\n24시간: ${btcChange}% ${btcIcon}\n\nⓔ 이더리움(ETH)\n가격: ${ethPrice}원\n24시간: ${ethChange}% ${ethIcon}\n\n⚠️ 투자는 신중하게!\n\n아파트 투자 상담은:\n📞 1588-0000`;
        } catch (error) {
            return '코인 정보를 가져오는 중 오류가 발생했습니다. 💰\n\n업비트나 빗썸 앱을 확인해주세요!\n\n아파트 분양 상담은:\n📞 1588-0000';
        }
    }
    
    return null;
}

function getGeneralKnowledgeResponse(lowerMessage) {
    if (lowerMessage.includes('시간') || lowerMessage.includes('몇 시') || lowerMessage.includes('지금')) {
        const now = new Date();
        const koreanTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
        const year = koreanTime.getFullYear();
        const month = koreanTime.getMonth() + 1;
        const date = koreanTime.getDate();
        const hours = koreanTime.getHours();
        const minutes = koreanTime.getMinutes();
        const dayOfWeek = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][koreanTime.getDay()];
        const ampm = hours >= 12 ? '오후' : '오전';
        const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
        
        return `현재 시간을 알려드릴게요! 🕐\n\n📅 ${year}년 ${month}월 ${date}일 ${dayOfWeek}\n⏰ ${ampm} ${displayHours}시 ${minutes}분 (한국 시간)\n\n아파트 상담 관련 문의도 언제든 환영합니다!\n📞 1588-0000`;
    }
    
    if (lowerMessage.includes('방정식') || lowerMessage.includes('수학')) {
        return '수학 관련 질문이시군요! 🧮\n\n죄송하지만 현재는 기본 모드로 작동 중이라 수학 문제 풀이는 어렵습니다.\n\n💡 더 정확한 답변을 원하시면:\n• OpenAI API 키를 설정해주세요\n• config.js 파일에서 OPENAI_API_KEY 입력\n\n그러면 수학, 과학, 역사 등 모든 질문에 답변 가능합니다!\n\n아파트 분양 관련 질문은 언제든 도와드릴 수 있습니다. 😊';
    }
    
    if (lowerMessage.includes('날씨')) {
        return '날씨 정보는 실시간 데이터가 필요해서 제공하기 어렵습니다. 🌤️\n\n날씨 정보는 기상청 앱이나 웹사이트를 이용해주세요!\n\n아파트 분양 관련해서는 언제든 도와드릴 수 있습니다!\n\n궁금하신 점:\n• 분양가\n• 위치 및 교통\n• 평형 정보\n• 상담 신청\n\n📞 1588-0000';
    }
    
    if (lowerMessage.includes('과학') || lowerMessage.includes('화학') || lowerMessage.includes('물리')) {
        return '과학 관련 질문이시군요! 🔬\n\n현재 기본 모드에서는 전문적인 과학 지식 답변이 어렵습니다.\n\nOpenAI API를 활성화하시면 모든 질문에 답변 가능합니다!\n\n아파트 분양 상담은 언제든 도와드리겠습니다. 😊';
    }
    
    if (lowerMessage.includes('프로그래밍') || lowerMessage.includes('코딩') || lowerMessage.includes('파이썬')) {
        return '프로그래밍 관련 질문이시군요! 💻\n\n기본 모드에서는 코딩 도움이 제한적입니다.\n\nAPI를 활성화하시면 프로그래밍 질문도 답변 가능합니다!\n\n아파트 관련 문의는 언제든 환영합니다! 😊';
    }
    
    return null;
}

quickReplies.forEach(btn => {
    btn.addEventListener('click', async () => {
        const question = btn.textContent;
        addUserMessage(question);
        
        const loadingMsg = addBotMessage('', true);
        
        try {
            let response;
            const lowerMessage = question.toLowerCase();
            
            const realTimeInfo = await getRealTimeInfo(lowerMessage);
            if (realTimeInfo) {
                response = realTimeInfo;
            } else if (CONFIG.OPENAI_API_KEY && CONFIG.OPENAI_API_KEY.trim() !== '') {
                response = await getOpenAIResponse(question);
                if (response === null) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    response = getFallbackResponse(question);
                }
            } else {
                await new Promise(resolve => setTimeout(resolve, 500));
                response = getFallbackResponse(question);
            }
            
            removeLoadingMessage();
            addBotMessage(response);
        } catch (error) {
            removeLoadingMessage();
            addBotMessage('❌ 오류가 발생했습니다. 다시 시도해주세요.');
        }
    });
});

async function handleSendMessage() {
    const message = chatbotInput.value.trim();
    if (message) {
        addUserMessage(message);
        chatbotInput.value = '';
        chatbotInput.disabled = true;
        chatbotSend.disabled = true;
        
        const loadingMsg = addBotMessage('', true);
        
        try {
            let response;
            const lowerMessage = message.toLowerCase();
            
            const realTimeInfo = await getRealTimeInfo(lowerMessage);
            if (realTimeInfo) {
                response = realTimeInfo;
            } else if (CONFIG.OPENAI_API_KEY && CONFIG.OPENAI_API_KEY.trim() !== '') {
                response = await getOpenAIResponse(message);
                if (response === null) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    response = getFallbackResponse(message);
                }
            } else {
                await new Promise(resolve => setTimeout(resolve, 500));
                response = getFallbackResponse(message);
            }
            
            removeLoadingMessage();
            addBotMessage(response);
        } catch (error) {
            removeLoadingMessage();
            addBotMessage('❌ 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            chatbotInput.disabled = false;
            chatbotSend.disabled = false;
            chatbotInput.focus();
        }
    }
}

chatbotSend.addEventListener('click', handleSendMessage);

chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
});
