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
