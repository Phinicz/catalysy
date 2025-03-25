'use client'
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

export interface ModalProps {
  children?: React.ReactNode
  transparent?: boolean
  style?: React.CSSProperties
  show: boolean
  closeModal?: () => void
}

export default function Modal({
  transparent=false,
  style={},
  children,
  show,
  closeModal
}: ModalProps) {
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setModalRoot(document?.getElementById('modal-root'));
  }, [])
  

  const ref = useRef(null);
  useEffect(() => {
    const checkIfClickedOutside = (e: MouseEvent) => {
      // @ts-ignore
      if (show && ref.current && !ref.current.contains(e.target) && closeModal) {
        closeModal();
      }
    }
    document.addEventListener("mousedown", checkIfClickedOutside)

    return () => {
      document.removeEventListener("mousedown", checkIfClickedOutside)
    }
  }, [show, closeModal]);
  if (!show || !modalRoot) return <></>
  return createPortal(
    <div className="fixed h-full inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className={``} ref={ref}>
        {children}
      </div>
    </div>,
    modalRoot as HTMLElement
  )
}