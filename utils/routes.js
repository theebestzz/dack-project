import { HiTrendingUp } from 'react-icons/hi'
import { RiTrophyLine } from 'react-icons/ri'
import { FaUserNinja } from 'react-icons/fa'
import { BiRocket } from 'react-icons/bi'

export const Routes = [
  {
    title: 'play uno!',
    url: '/uno',
    icon: <FaUserNinja />,
    key: 'dLo96JGSMa',
  },
  {
    title: 'quack',
    url: '/',
    icon: <HiTrendingUp />,
    key: 'ApEGH1gjlY',
    large: true,
  },
  {
    title: 'stake',
    url: '/',
    icon: <BiRocket />,
    key: 'b3VsuwE56E',
  },
  {
    title: 'docs',
    url: 'https://docs.dacks.xyz/',
    icon: <RiTrophyLine />,
    key: 'vSbuPnpljq',
  }
]
