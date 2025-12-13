프로젝트에 대한 설명은 [README.md](./README.md)를 참고하세요.

## 기술 스택

- Three.js (React Three Fiber)
- React
- TypeScript
- Vite
- Turborepo (monorepo)
- pnpm

## 아키텍처

GEF(Graphical Editing Framework) 스타일의 그래픽 에디터 패턴을 따른다.

### GEF → 게임 코드 이름 매핑

| GEF 개념       | 게임 코드                     | 역할                       |
| -------------- | ----------------------------- | -------------------------- |
| GraphicEditor  | `RoomEditor`                  | 편집기 컨테이너            |
| GraphicViewer  | `RoomViewer`                  | 편집 뷰어                  |
| Model          | `RoomModel`, `FurnitureModel` | 도메인 데이터              |
| Figure         | `RoomView`, `FurnitureView`   | 시각적 표현                |
| Part           | `RoomPart`, `FurniturePart`   | Controller (MVC)           |
| RootPart       | `RoomPart`                    | Part 트리의 루트           |
| PartFactory    | `FurnitureFactory`            | Model → Part 생성          |
| Tool           | `Tool`                        | 도구 (선택, 이동, 회전 등) |
| EditPolicy     | `EditPolicy`                  | 마이크로컨트롤러           |
| Request        | `Request`                     | 이벤트 추상화              |
| CommandStack   | `CommandStack`                | History (Undo/Redo)        |
| ActionRegistry | `ActionRegistry`              | 단축키/액션 관리           |

### UI 레이아웃

```
Workbench
├── Menu
├── Toolbar
├── 중앙 영역
│   ├── Tool (좌측) - 도구 선택
│   ├── Canvas (중앙) - 3D 편집 공간
│   └── 우측 패널
│       ├── Property - 선택된 객체 속성
│       ├── Palette - 가구 목록
│       ├── History - Undo/Redo
│       └── Layer
└── Status
```

### 내부 구조

```
RoomEditor
├── RoomModel              # 방 도메인 모델
├── RoomViewer             # 편집 뷰어
│   ├── EventDispatcher    # 저수준 → 에디터 이벤트 변환
│   ├── CommandStack       # History 관리 (Undo/Redo)
│   └── RoomPart           # Part 트리의 루트
│       ├── FurniturePart  # 가구 Part
│       └── ...
├── Tool                   # 활성 도구
├── FurnitureFactory       # FurnitureModel → FurniturePart 생성
└── ActionRegistry         # 단축키/액션 관리
```

### Part - Model - View (MVC)

```
      Part (Controller)
       ↑         │
   Event      Model change command
       │         ↓
     View  ←── Model
   (Figure)    (Data)
```

- **Part**: Controller. Model과 View를 연결하는 중재자. 편집의 최소 단위.
- **Model**: 도메인 데이터.
- **View**: 시각적 표현 (GEF의 Figure).

Part는 React Fiber와 유사하게 트리를 이루며, 각 Part가 대응하는 Model과 View를 연결한다.

### Part 트리

```
RoomPart (루트)
├── FurniturePart (침대) ──→ FurnitureModel, FurnitureView
├── FurniturePart (책상) ──→ FurnitureModel, FurnitureView
└── FurniturePart (의자) ──→ FurnitureModel, FurnitureView
```

### Request & EditPolicy

- **Request**: 이벤트의 추상화 (예: SelectionRequest, MoveRequest)
- **EditPolicy**: Part에 붙는 마이크로컨트롤러. 특정 편집 동작 담당.

```
User Input → EventDispatcher → Request → Part → EditPolicy → Command → CommandStack → Model 변경 → View 갱신
```
