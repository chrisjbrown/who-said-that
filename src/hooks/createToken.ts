export default async function createToken(token, data) {
   token.layer.hud.element[0].insertAdjacentHTML(
      "beforeend",
      `
        <div id="WSTChatBubble"><i class="fa-solid fa-heart fa-beat"></i></div>
      `
   );
}
