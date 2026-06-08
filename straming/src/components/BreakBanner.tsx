/**
 * Full-screen break banner for OBS overlay
 * Shows when Super Productivity enters break time
 */

import { useRef } from 'react'
import type { SpFocusMode } from '../hooks/useSuperProductivity'
import { formatMs } from '../hooks/useSuperProductivity'
import './BreakBanner.css'

interface BreakBannerProps {
  focusMode: SpFocusMode
}

// Full exercise tip list — kept in sync with Angular's break-ideas.const.ts
const BREAK_TIPS = [
  { title: 'Not alone', text: 'Do you find it hard to take a break alone? Try to do it with a co-worker. Taking breaks together increases productivity.' },
  { title: 'Step away', text: 'Do you ever notice how your brain can figure things out by itself? All it takes is to step away from the computer and think about something totally unrelated.' },
  { title: 'Microbreaks', text: 'Rest is a key component in ensuring the performance of the musculoskeletal system. Frequent breaks can decrease the duration of a task and help lower ergonomic injury risk.' },
  { title: 'Meditation', text: 'Research studies suggest that mindfulness-based exercises help decrease anxiety, depression, stress, and pain, and improve general health and quality of life.' },
  { title: 'Blink', text: 'Looking at screens for a long time causes you to blink less. Blink rapidly for a few seconds to refresh the tear film and clear dust from the eye surface.' },
  { title: 'Ergonomics', text: 'Improper height and angle of the keyboard, mouse, monitor or working surface can cause health problems. Take some time to read about desk ergonomics.' },
  { title: 'Move', text: 'There are a lot of ways you can exercise within your office. Try marching in place or doing desk push-ups.' },
  { title: 'Change', text: 'Do you have a stability ball or standing work desk? Consider replacing your desk chair with them for a while.' },
  { title: 'Notice', text: 'Are you daydreaming or having trouble focusing? It is a sign that you need to take a break.' },
  { title: 'Tech', text: 'How about taking a no-tech walk?' },
  { title: 'Metabolism', text: 'Sitting for long periods contributes to metabolic syndrome and heart risk. Taking regular walking breaks can help your circulation.' },
  { title: 'Active Meetings', text: 'How about moving meetings from the conference room to the concourse? Walking not only burns calories but may foster a sense of collaboration.' },
  { title: 'Fruit', text: 'Take your time and eat some fruit. Slowly. Notice the flavor, the texture, the freshness.' },
  { title: 'Bathrooms', text: 'Walk to the farthest bathroom in the worksite facility when going to the restroom.' },
  { title: 'Coffee break', text: 'Going on coffee break? Consider doing a 5-minute walk every time you go for one.' },
  { title: 'Colleagues', text: 'Do not email or message office colleagues — walk to their desks to communicate with them.' },
  { title: 'Learning', text: 'NIH researchers found that taking short breaks, early and often, may help our brains learn new skills.' },
  { title: 'Exercise', text: 'Evidence suggests small amounts of regular exercise can bring dramatic health benefits, including measurably reducing stress.' },
  { title: 'Repeat', text: 'Have you found your stretch routine? Repeat it more than once to better fight the effects of prolonged sitting.' },
  { title: 'Wrist and forearm', text: 'Extend your arms with the palms facing towards you, then slowly rotate the hands four times clockwise, then four times counter-clockwise.' },
  { title: 'Back stretching', text: 'Join your hands behind your head, then lift them together up above your head ending with your palms facing upward.' },
  { title: 'Mobilize', text: 'For every thirty minutes of stagnation, you should have at least one minute of stimulation.' },
  { title: '7 Minute Workout', text: 'This workout packs in a full-body exercise routine in a fraction of the time. There are numerous apps to get you started.' },
  { title: 'Pulse', text: 'Raise your pulse rate to 120 beats per minute for 20 straight minutes four or five times a week. Regularly raising your heart rate results in improved cardiovascular health.' },
  { title: 'Take the stairs', text: 'Stair climbing burns more calories per minute than jogging.' },
  { title: 'Make art', text: 'Art therapy has great mental health benefits, especially for stress management. Write a quick poem, take a picture, or paint something small.' },
  { title: 'Declutter', text: 'A clean space helps your focus at work and is often linked to positive emotions like happiness.' },
  { title: 'Lunch outside', text: 'Nature is linked to positive emotions and decreased stress. Whenever possible, take your daily lunch break outside surrounded by some greenery.' },
  { title: 'Public transport', text: 'If you use public transport, stand instead of sitting. Try to replace daily trips with walking or cycling when possible.' },
  { title: 'Yawning', text: 'Yawning can be really helpful, as it produces tears to help moisten and lubricate the eyes.' },
  { title: 'Focus change', text: 'Hold one finger close to the eye and focus on it. Slowly move the finger away, focus far into the distance and then back to the finger.' },
  { title: 'Palming', text: 'While seated, brace elbows on the desk. Let your weight fall forward and cup hands over eyes. Close your eyes and inhale slowly through your nose.' },
  { title: 'Hand squeezes', text: 'Squeeze a pair of balled-up socks or a soft rubber ball, hold for 5 seconds. Repeat the whole process a few times.' },
  { title: 'Slow Breathing', text: 'Controlled slow breathing techniques can optimize physiological parameters associated with health and longevity.' },
  { title: 'Imaginative visualization', text: 'Close your eyes and imagine yourself in a peaceful place — a beach or a forest — focusing on the sights, sounds, and sensations.' },
  { title: 'Overwhelmed?', text: 'Try the 5-4-3-2-1 Grounding Technique: Identify 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste.' },
]

function getRandomTip() {
  return BREAK_TIPS[Math.floor(Math.random() * BREAK_TIPS.length)]
}

export function BreakBanner({ focusMode }: BreakBannerProps) {
  // Track the last break session so we only re-randomize when a NEW break starts,
  // not on every render tick (focusMode.remaining changes every second).
  // We use a ref (not state) to avoid triggering re-renders.
  const lastBreakActiveRef = useRef(false)
  const tipRef = useRef(getRandomTip())

  if (focusMode.isBreakActive && !lastBreakActiveRef.current) {
    // Break just became active — pick a fresh tip for this break session
    tipRef.current = getRandomTip()
  }
  lastBreakActiveRef.current = focusMode.isBreakActive

  const tip = tipRef.current
  const breakType = focusMode.isLongBreak ? 'Long Break' : 'Mini Break'
  const timeRemaining = formatMs(focusMode.remaining)

  // Handle break completed state
  if (focusMode.isBreakCompleted) {
    return (
      <div className="break-banner">
        <div className="break-banner-content">
          <div className="break-emoji">✅</div>
          <h1 className="break-title">BREAK COMPLETE!</h1>
          <div className="break-type">Ready for Next Session</div>
          <div className="break-timer">00:00</div>
          
          <div className="break-progress-bar">
            <div 
              className="break-progress-fill" 
              style={{ width: '100%' }}
            />
          </div>

          <div className="break-tip-card">
            <div className="break-tip-icon">🎯</div>
            <div className="break-tip-content">
              <h3 className="break-tip-title">Break Complete!</h3>
              <p className="break-tip-text">Your break is finished. Take a moment to decide what to do next - continue with another focus session or wrap up for the day.</p>
            </div>
          </div>

          <div className="break-cycle-info">
            🍅 Cycle {focusMode.currentCycle} - Waiting for next session
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="break-banner">
      <div className="break-banner-content">
        <div className="break-emoji">🧘</div>
        <h1 className="break-title">BREAK TIME</h1>
        <div className="break-type">{breakType}</div>
        <div className="break-timer">{timeRemaining}</div>
        
        <div className="break-progress-bar">
          <div 
            className="break-progress-fill" 
            style={{ width: `${focusMode.progress}%` }}
          />
        </div>

        <div className="break-tip-card">
          <div className="break-tip-icon">💡</div>
          <div className="break-tip-content">
            <h3 className="break-tip-title">{tip.title}</h3>
            <p className="break-tip-text">{tip.text}</p>
          </div>
        </div>

        <div className="break-cycle-info">
          🍅 Cycle {focusMode.currentCycle}
        </div>
      </div>
    </div>
  )
}
