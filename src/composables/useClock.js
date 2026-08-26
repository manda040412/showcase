import { ref, onMounted, onUnmounted } from 'vue'

export function useClock() {
  const time = ref('')
  const date = ref('')

  function update() {
    const now = new Date()
    const h = String(now.getHours()).padStart(2, '0')
    const m = String(now.getMinutes()).padStart(2, '0')
    const s = String(now.getSeconds()).padStart(2, '0')
    time.value = `${h}:${m}:${s}`

    const days = ['SUN','MON','TUE','WED','THU','FRI','SAT']
    date.value = `${days[now.getDay()]} ${now.getDate().toString().padStart(2,'0')}.${String(now.getMonth()+1).padStart(2,'0')}.${now.getFullYear()}`
  }

  let timer
  onMounted(() => { update(); timer = setInterval(update, 1000) })
  onUnmounted(() => clearInterval(timer))

  return { time, date }
}
