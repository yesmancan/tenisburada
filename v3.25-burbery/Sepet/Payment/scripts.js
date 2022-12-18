var hasAddCard = false;
var checkIzy = setInterval(() => {
    if(document.querySelectorAll('.card-animation').length > 1){
        clearInterval(checkIzy);
    }
    if (document.querySelector('#paymentTab-13 [name="cardHolderName"]')) {
        initCardAnimation(true);
        initCardAnimation(false);
        hasAddCard=true;
    }
}, 300);
function initCardAnimation(hide) {
    if(hasAddCard){
        clearInterval(checkIzy);
        return;
    }
    const cardInitArae = document.querySelector('.css-1o39wq4-Popup-Box-Box.e1xekicq2');

    const cardHTML = `<div class="card-animation ${hide == true ? "": "hide"}"><div class="flip-container"><div class="flipper" style="perspective: 586.656px; position: relative; transform-style: preserve-3d;"><div class="front" style="height: 100%; width: 100%; backface-visibility: hidden; transform-style: preserve-3d; position: absolute; z-index: 1; transition: all 0.5s ease-out 0s;"><div class="front-inner"><img id="cardBrandImg" class="CardBank hide" alt="" style="position:absolute;margin:10px;"src="/Data/KrediKartLogo/New/0_.png"><span class="CardOwner"></span><span class="CardNo">0000 0000 0000 0000</span><img src="https://cdn.knitss.com/Data/EditorFiles/anasayfamasaustu/kasim/CreditCardBG122.png"><span class="CardSkt">01/15</span><span class="CardType"></span></div></div><div class="back"style="transform: rotateY(-180deg); height: 100%; width: 100%; backface-visibility: hidden; transform-style: preserve-3d; position: absolute; z-index: 0; transition: all 0.5s ease-out 0s;"><div class="front-inner"><img src="https://cdn.knitss.com/Data/EditorFiles/anasayfamasaustu/kasim/CreditC.png"><span class="CVCNo"></span></div></div></div></div></div>`
    const cardHolderName = document.querySelector('#paymentTab-13 [name="cardHolderName"]');
    const cardNo = document.querySelector('#paymentTab-13 [name="cardNumber"]');
    const cardExpireDate = document.querySelector('#paymentTab-13 [name="expireDate"]');
    const cardCvc = document.querySelector('#paymentTab-13 [name="cvc"]');

    const cardFlipper = document.querySelector('#paymentTab-13 .card-animation .flip-container')
    const cardHolderAnimationArea = document.querySelector('#paymentTab-13 .card-animation .CardOwner')
    const cardNoAnimationArea = document.querySelector('#paymentTab-13 .card-animation .CardNo')
    const cardExpireDateAnimationArea = document.querySelector('#paymentTab-13 .card-animation .CardSkt')
    const cardCVCNoAnimationArea = document.querySelector('#paymentTab-13 .card-animation .CVCNo')
    cardInitArae.insertAdjacentHTML('beforeEnd', cardHTML);

    cardHolderName.addEventListener('keyup', () => {
        cardHolderAnimationArea.innerText = cardHolderName.value;
    });
    cardNo.addEventListener('keyup', () => {
        cardNoAnimationArea.innerText = cardNo.value;
    });
    cardExpireDate.addEventListener('keyup', () => {
        cardExpireDateAnimationArea.innerText = cardExpireDate.value;
    });
    cardCvc.addEventListener('keyup', () => {
        cardCVCNoAnimationArea.innerText = cardCvc.value;
    });
    cardCvc.addEventListener('focus', () => {
        cardFlipper.classList.add('hover')
    });
    cardCvc.addEventListener('blur', () => {
        cardFlipper.classList.remove('hover')
    });
}